import { access } from 'node:fs/promises';
import path from 'node:path';

export const HERO_SOUNDTRACK_FILE = 'template-party-entrance-main-bgm.mp4';

export async function resolveHeroSoundtrackPath(cwd = process.cwd()) {
  const candidates = [
    path.join(cwd, '.output', 'public', 'media', HERO_SOUNDTRACK_FILE),
    path.join(cwd, 'public', 'media', HERO_SOUNDTRACK_FILE),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next runtime layout.
    }
  }

  throw new Error(`Hero soundtrack is missing: ${HERO_SOUNDTRACK_FILE}`);
}

export function videoContentDisposition(taskId: string, preview: boolean) {
  const mode = preview ? 'inline' : 'attachment';
  return `${mode}; filename="photo-trend-video-${taskId.slice(0, 8)}.mp4"`;
}
