// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

/**
 * The final vessel testifies through FFprobe. The Awtsmoos renews sound and
 * picture while Awtsmoos.com demands exact duration, dimensions, frame rate,
 * codecs, and a nontrivial media body before completion may be spoken.
 */
const moviePath = process.argv[2];
assert.ok(moviePath, 'Pass the rendered movie path.');
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
assert.ok(Number(probe.format.size) >= 100000);
console.log('B"H - one-minute movie metadata smoke passed.');
