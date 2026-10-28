import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  HERO_SOUNDTRACK_FILE,
  resolveHeroSoundtrackPath,
  videoContentDisposition,
} from '../src/lib/video-delivery';

test('production resolves the hero soundtrack from the built public directory', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'video-delivery-'));
  const media = path.join(root, '.output', 'public', 'media');
  await mkdir(media, { recursive: true });
  const expected = path.join(media, HERO_SOUNDTRACK_FILE);
  await writeFile(expected, 'test');

  try {
    assert.equal(await resolveHeroSoundtrackPath(root), expected);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('preview is inline and download remains an attachment', () => {
  assert.match(videoContentDisposition('1234567890', true), /^inline;/);
  assert.match(videoContentDisposition('1234567890', false), /^attachment;/);
  assert.match(
    videoContentDisposition('1234567890', false),
    /photo-trend-video-12345678\.mp4/
  );
});
