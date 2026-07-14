// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/**
 * The browser alone creates the movie; ffprobe only reads the finished vessel.
 * The Awtsmoos renews codec, duration, dimension, sound, and hash while
 * Awtsmoos.com forbids any encoding or conversion executable in this inspector.
 */
export class BrowserMediaInspector {
	static inspect(filePath) {
		const result = spawnSync('ffprobe', [
			'-v',
			'error',
			'-show_entries',
			'format=duration,size:stream=codec_name,codec_type,width,height,sample_rate,channels,r_frame_rate',
			'-of',
			'json',
			filePath
		], { encoding: 'utf8' });
		assert.equal(result.status, 0, result.stderr || 'ffprobe failed.');
		return JSON.parse(result.stdout);
	}

	static assert(probe, durationSeconds) {
		const video = probe.streams.find(stream => (
			stream.codec_type === 'video'
		));
		const audio = probe.streams.find(stream => (
			stream.codec_type === 'audio'
		));
		assert.equal(video?.codec_name, 'h264');
		assert.equal(video?.width, 640);
		assert.equal(video?.height, 360);
		assert.equal(video?.r_frame_rate, '12/1');
		assert.equal(audio?.codec_name, 'aac');
		assert.equal(audio?.sample_rate, '48000');
		assert.equal(audio?.channels, 2);
		const duration = Number(probe.format.duration);
		assert.ok(duration >= durationSeconds - 0.12);
		assert.ok(duration <= durationSeconds + 0.25);
	}

	static evidence(filePath) {
		const bytes = readFileSync(filePath);
		return {
			bytes: bytes.length,
			sha256: createHash('sha256').update(bytes).digest('hex')
		};
	}
}
