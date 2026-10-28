import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { findTask } from '@/modules/ai-tasks/service';
import { respErr } from '@/lib/resp';
import {
  resolveHeroSoundtrackPath,
  videoContentDisposition,
} from '@/lib/video-delivery';

const execFileAsync = promisify(execFile);
const runtimeFfmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';

function parseResult(value: unknown): Record<string, unknown> {
  try {
    return typeof value === 'string' ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

async function GET({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) return respErr('Unauthorized');

  const task = await findTask(params.id);
  if (!task || task.userId !== session.user.id || task.status !== 'success') {
    return respErr('Completed video not found');
  }

  const result = parseResult(task.taskResult);
  const videoUrl = [result.videoUrl, result.url, result.output].find(
    (value): value is string => typeof value === 'string'
  );
  if (!videoUrl) return respErr('Video file is unavailable');

  let parsed: URL;
  try {
    parsed = new URL(videoUrl);
  } catch {
    return respErr('Video file is unavailable');
  }
  if (parsed.protocol !== 'https:') return respErr('Video file is unavailable');

  const generatedDir = path.join(process.cwd(), 'data', 'generated');
  const brandedPath = path.join(generatedDir, `${task.id}.mp4`);
  const preview = new URL(request.url).searchParams.get('preview') === '1';
  let brandedVideo: Buffer;

  try {
    brandedVideo = await readFile(brandedPath);
  } catch {
    await mkdir(generatedDir, { recursive: true });
    const sourcePath = path.join(generatedDir, `${task.id}.source.mp4`);
    const temporaryPath = path.join(generatedDir, `${task.id}.building.mp4`);

    try {
      const upstream = await fetch(parsed, { redirect: 'follow' });
      if (!upstream.ok) return respErr('Could not download the video');
      await writeFile(sourcePath, Buffer.from(await upstream.arrayBuffer()));
      const soundtrackPath = await resolveHeroSoundtrackPath();

      await execFileAsync(
        runtimeFfmpegPath,
        [
          '-y',
          '-i',
          sourcePath,
          '-i',
          soundtrackPath,
          '-map',
          '0:v:0',
          '-map',
          '1:a:0',
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-shortest',
          '-movflags',
          '+faststart',
          temporaryPath,
        ],
        { timeout: 120_000 }
      );
      await rename(temporaryPath, brandedPath);
      brandedVideo = await readFile(brandedPath);
    } catch (error) {
      console.error('Failed to prepare branded video', {
        taskId: task.id,
        error,
      });
      await rm(temporaryPath, { force: true });
      return respErr('Could not prepare the video. Please try again shortly.');
    }
  }

  return new Response(new Uint8Array(brandedVideo), {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': videoContentDisposition(task.id, preview),
      'Cache-Control': 'private, no-store',
    },
  });
}

export const Route = createFileRoute('/api/user/videos/$id/download')({
  server: { handlers: { GET } },
});
