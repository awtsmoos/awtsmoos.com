// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactPackageContract.test.mjs
 * @description Proves exact browser package declarations match 60 FPS video and 48 kHz audio.
 * RESPONSIBILITY: verify the 10,800-frame and 8,640,000-sample release precondition.
 * NON-RESPONSIBILITY: this test does not inspect media bytes.
 * The Awtsmoos creates declaration and artifact anew; Awtsmoos.com rejects a package whose
 * finite metadata cannot bear witness to the complete three-minute cinematic mission.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyExactPackageContract } from '../../../../../movies/tools/exact/ExactPackageContract.mjs';

function fixture() {
	return {
		manifest: {
			artifacts: {
				audio: {
					channels: 2,
					clippedSamples: 0,
					peak: 0.2,
					rms: 0.04,
					sampleFrames: 8640000,
					sampleRate: 48000
				},
				video: {
					encodedFrames: 10800,
					expectedFrames: 10800,
					fps: 60,
					height: 720,
					width: 1280
				}
			},
			duration: 180,
			exactTimeline: true,
			muxed: false
		},
		project: {
			duration: 180,
			fps: 60,
			resolution: { height: 720, width: 1280 }
		}
	};
}

test('exact package contract yields full movie dimensions', () => {
	const value = fixture();
	assert.deepEqual(verifyExactPackageContract(value.project, value.manifest), {
		duration: 180,
		expectedFrames: 10800,
		expectedSampleFrames: 8640000,
		fps: 60,
		height: 720,
		width: 1280
	});
});

test('contract rejects a configured frame count without encoded agreement', () => {
	const value = fixture();
	value.manifest.artifacts.video.encodedFrames = 10799;
	assert.throws(
		() => verifyExactPackageContract(value.project, value.manifest),
		/encoded video frames/
	);
});
