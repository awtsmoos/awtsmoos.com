/* B"H */
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildMediaPlaylist } from '../modules/export/HlsExporter.js';
import { ffprobeProofDescriptor } from '../modules/export/Validation.js';
const playlist = buildMediaPlaylist([{ name:'seg-000000.ts', duration:2 }, { name:'seg-000001.ts', duration:2.1 }], { targetDuration:3, end:true });
assert.ok(playlist.includes('#EXTM3U'));
assert.ok(playlist.includes('#EXT-X-ENDLIST'));
assert.equal(ffprobeProofDescriptor('codec_name=h264\ncodec_name=aac').ok, true);
const dir = await mkdtemp(join(tmpdir(), 'nesher-hls-proof-'));
try {
  await writeFile(join(dir, 'index.m3u8'), playlist);
  await writeFile(join(dir, 'proof.txt'), 'text proof only; no repo media artifacts');
  const ffprobe = spawnSync('ffprobe', ['-version'], { encoding:'utf8' });
  const ffmpeg = spawnSync('ffmpeg', ['-version'], { encoding:'utf8' });
  const availability = { ffprobe:ffprobe.status === 0, ffmpeg:ffmpeg.status === 0 };
  console.log(JSON.stringify({ ok:true, playlistLines:playlist.split('\n').length, availability, tmpDirRemoved:true }));
} finally {
  await rm(dir, { recursive:true, force:true });
}
