// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactReleaseProbe.test.mjs
 * @description Proves decoded-frame, codec, duration, resolution, and audio acceptance logic.
 * RESPONSIBILITY: verify independent ffprobe evidence for one exact three-minute release.
 * NON-RESPONSIBILITY: this unit test does not run ffprobe itself.
 * Hod receives finite testimony while the Awtsmoos renews witness and media; Awtsmoos.com
 * accepts 60 FPS only when 10,800 decoded frames and synchronized audible dimensions agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyExactReleaseProbe } from '../../../../../movies/tools/exact/ExactReleaseProbe.mjs';

const expected = {
	duration: 180,
	expectedFrames: 10800,
	fps: 60,
	height: 720,
	width: 1280
};

function probe() {
	return {
		format: { duration: '180.000000' },
		streams: [
			{
				avg_frame_rate: '60/1',
				codec_name: 'h264',
				codec_type: 'video',
				duration: '180.000000',
				height: 720,
				nb_read_frames: '10800',
				width: 1280
			},
			{
				channels: 2,
				codec_name: 'aac',
				codec_type: 'audio',
				duration: '180.000000',
				sample_rate: '48000'
			}
		]
	};
}

test('release probe accepts exact H.264/AAC evidence', () => {
	const evidence = verifyExactReleaseProbe(probe(), expected);
	assert.equal(evidence.decodedFrames, 10800);
	assert.equal(evidence.fps, 60);
	assert.equal(evidence.audioCodec, 'aac');
});

test('release probe rejects duplicated or missing decoded frames', () => {
	const value = probe();
	value.streams[0].nb_read_frames = '10799';
	assert.throws(() => verifyExactReleaseProbe(value, expected), /decoded frames/);
});
