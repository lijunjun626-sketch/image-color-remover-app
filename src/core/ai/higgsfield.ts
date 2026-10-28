const API_BASE = 'https://api.higgsfield.ai';
const REQUEST_TIMEOUT_MS = 30_000;

export const GENJUTSU_MODEL =
  'higgsfield/genjutsu/motion-transfer/v1.0' as const;

export type HiggsfieldUpload = {
  upload_url: string;
  upload_headers?: Record<string, string>;
  public_url: string;
};

export type HiggsfieldSubmission = {
  status: string;
  request_id: string;
  status_url: string;
  cancel_url: string;
};

export type HiggsfieldStatus = {
  status: string;
  request_id?: string;
  video?: { url?: string };
  error?: string | { message?: string };
  [key: string]: unknown;
};

async function providerRequest<T>(
  apiKey: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  // Admins commonly paste either the complete credential or the complete
  // Authorization value. Accept both while keeping the secret server-side.
  const credential = apiKey.trim().replace(/^Key\s+/i, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Key ${credential}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const correlationId = response.headers.get('x-correlation-id');
      const message =
        payload?.detail ||
        payload?.message ||
        payload?.error ||
        `Higgsfield request failed (${response.status})`;
      const detail =
        typeof message === 'string' ? message : JSON.stringify(message);
      const hint =
        response.status === 401
          ? ' Check that the complete API key was copied.'
          : response.status === 403
            ? ' Higgsfield rejected this account request; verify the API balance and account access.'
            : '';
      throw new Error(
        `Higgsfield ${response.status}: ${detail}.${hint}${
          correlationId ? ` Correlation ID: ${correlationId}` : ''
        }`
      );
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Higgsfield request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function createHiggsfieldUpload(
  apiKey: string,
  contentType: string
): Promise<HiggsfieldUpload> {
  return providerRequest(apiKey, '/files/generate-upload-url', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType }),
  });
}

export async function uploadToHiggsfield(
  apiKey: string,
  body: Blob | ArrayBuffer | Uint8Array,
  contentType: string
): Promise<string> {
  const signed = await createHiggsfieldUpload(apiKey, contentType);
  const response = await fetch(signed.upload_url, {
    method: 'PUT',
    headers: signed.upload_headers || { 'Content-Type': contentType },
    body: body as BodyInit,
  });
  if (!response.ok) {
    throw new Error(`Reference upload failed (${response.status})`);
  }
  return signed.public_url;
}

export function submitGenjutsu(
  apiKey: string,
  input: {
    videoUrl: string;
    imageUrls: string[];
    prompt?: string;
    resolution?: '480p' | '720p' | '1080p';
  }
): Promise<HiggsfieldSubmission> {
  return providerRequest(apiKey, `/${GENJUTSU_MODEL}`, {
    method: 'POST',
    body: JSON.stringify({
      video_url: input.videoUrl,
      image_urls: input.imageUrls,
      resolution: input.resolution || '480p',
      ...(input.prompt ? { prompt: input.prompt } : {}),
    }),
  });
}

export function getHiggsfieldStatus(
  apiKey: string,
  requestId: string
): Promise<HiggsfieldStatus> {
  return providerRequest(
    apiKey,
    `/requests/${encodeURIComponent(requestId)}/status`
  );
}

export function isHiggsfieldTerminal(status: string) {
  return ['completed', 'failed', 'nsfw', 'canceled'].includes(status);
}
