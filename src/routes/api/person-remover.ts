import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  AITaskStatus,
  createTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const EDIT_CREDITS = 1;
const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

function asFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File ? value : null;
}

function isAllowedImage(file: File | null): file is File {
  return (
    !!file &&
    allowedTypes.has(file.type) &&
    file.size > 0 &&
    file.size <= MAX_FILE_BYTES
  );
}

async function POST({ request }: { request: Request }) {
  let taskId: string | null = null;
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Sign in before starting an AI edit.');

    const ipLimited = enforceMinIntervalRateLimit(request, {
      intervalMs: 15_000,
      keyPrefix: 'person-remover',
    });
    if (ipLimited) return ipLimited;
    const userLimited = enforceMinIntervalRateLimit(request, {
      intervalMs: 15_000,
      keyPrefix: 'person-remover',
      extraKey: session.user.id,
    });
    if (userLimited) return userLimited;

    const configs = await getAllConfigs();
    const apiKey = configs.openai_api_key?.trim();
    if (!apiKey) {
      return respErr(
        'AI editing is not configured yet. An administrator must add the OpenAI API key first.'
      );
    }

    const form = await request.formData();
    const image = asFile(form.get('image'));
    const mask = asFile(form.get('mask'));
    if (
      !isAllowedImage(image) ||
      !mask ||
      mask.type !== 'image/png' ||
      mask.size > MAX_FILE_BYTES
    ) {
      return respErr(
        'Send a PNG, JPG, or WebP image and a matching PNG mask, each under 10 MB.'
      );
    }

    const prompt =
      'Remove only the person or object indicated by the transparent mask. Reconstruct the newly exposed background naturally. Preserve every unmasked person, object, text, color, composition, and camera perspective. Do not remove watermarks, copyright notices, or safety labels.';
    const task = await createTask({
      userId: session.user.id,
      mediaType: 'image',
      provider: 'openai',
      model: 'gpt-image-2.5-sunburst',
      prompt,
      costCredits: EDIT_CREDITS,
      options: { operation: 'remove_person', storage: 'ephemeral' },
    });
    taskId = task.id;

    const providerForm = new FormData();
    providerForm.set('model', 'gpt-image-2.5-sunburst');
    providerForm.set('quality', 'low');
    providerForm.set('image[]', image, 'source.png');
    providerForm.set('mask', mask, 'selection.png');
    providerForm.set('prompt', prompt);
    providerForm.set('response_format', 'b64_json');

    const baseUrl = (
      configs.openai_base_url || 'https://api.openai.com/v1'
    ).replace(/\/+$/, '');
    const providerResponse = await fetch(`${baseUrl}/images/edits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: providerForm,
    });
    const payload = await providerResponse.json().catch(() => null);
    if (!providerResponse.ok) {
      const message =
        typeof payload?.error?.message === 'string'
          ? payload.error.message
          : 'The image provider could not complete this edit.';
      throw new Error(message);
    }
    const imageBase64 = payload?.data?.[0]?.b64_json;
    if (typeof imageBase64 !== 'string' || !imageBase64)
      throw new Error('The image provider returned no image.');

    await updateTask({
      taskId,
      status: AITaskStatus.SUCCESS,
      taskResult: { operation: 'remove_person', outputStored: false },
    });
    return respData({
      taskId,
      imageDataUrl: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error: any) {
    if (taskId) {
      await updateTask({
        taskId,
        status: AITaskStatus.FAILED,
        taskResult: { error: error?.message || 'Image edit failed' },
      }).catch(() => undefined);
    }
    return respErr(error?.message || 'The image edit could not be started.');
  }
}

export const Route = createFileRoute('/api/person-remover')({
  server: { handlers: { POST } },
});
