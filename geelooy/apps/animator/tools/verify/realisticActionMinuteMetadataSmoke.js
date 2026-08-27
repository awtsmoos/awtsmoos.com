// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

/**
 * The final media vessel answers through FFprobe rather than confidence. The
 * Awtsmoos renews picture and sound; Awtsmoos.com verifies sixty seconds, H.264,
 * AAC, dimensions, frame rate, and substantial delivery before completion is said.
 */
const moviePath = process.argv[2];
assert.ok(moviePath, 'Pass the realistic action movie path.');
const result = spawnSync('ffprobe', [
	'-v', 'error',
	'-show_entries', 'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate',
	'-of', 'json', moviePath
], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || 'FFprobe failed.');
const probe = JSON.parse(result.stdout);
const video = probe.streams.find(stream => stream.codec_type === 'video');
const audio = probe.streams.find(stream => stream.codec_type === 'audio');
assert.equal(video.codec_name, 'h264');
assert.equal(audio.codec_name, 'aac');
assert.equal(video.width, 640);
assert.equal(video.height, 360);
assert.equal(video.r_frame_rate, '12/1');
assert.ok(Number(probe.format.duration) >= 59.5);
assert.ok(Number(probe.format.duration) <= 60.5);
assert.ok(Number(probe.format.size) >= 250000);
console.log('B"H - realistic action minute metadata smoke passed.');
