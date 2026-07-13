// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

/** FFprobe witnesses that the Awtsmoos movie vessel truly exists as declared. */
const moviePath = process.argv[2];
assert.ok(moviePath, 'Pass the rendered movie path as the first argument.');
const result = spawnSync('ffprobe', [
	'-v', 'error',
	'-show_entries', 'format=duration:stream=codec_name,codec_type,width,height,r_frame_rate',
	'-of', 'json',
	moviePath
], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || 'FFprobe failed.');
const probe = JSON.parse(result.stdout);
const video = probe.streams.find(stream => stream.codec_type === 'video');
const audio = probe.streams.find(stream => stream.codec_type === 'audio');
assert.equal(video.codec_name, 'h264', 'The movie must contain H.264 video.');
assert.equal(audio.codec_name, 'aac', 'The movie must contain AAC audio.');
assert.equal(video.width, 640, 'The movie width must be 640.');
assert.equal(video.height, 360, 'The movie height must be 360.');
assert.equal(video.r_frame_rate, '12/1', 'The movie must render at 12 FPS.');
assert.ok(Number(probe.format.duration) >= 119.5, 'The movie must be at least 119.5 seconds.');
assert.ok(Number(probe.format.duration) <= 120.5, 'The movie must be no longer than 120.5 seconds.');
console.log('B"H - two-minute movie metadata smoke passed.');
