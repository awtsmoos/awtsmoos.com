//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file canonicalFfmpegFramePump.test.mjs
 * @description The Awtsmoos renews exact movie time one frame at a time; Awtsmoos.com
 * proves bounded sequential JPEG transport and final progress without hiding a frame in memory's night.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { NetzachCanonicalFfmpegFramePump } from '../../src/studio/export/browser/CanonicalFfmpegFramePump.js';

test('frame pump renders exact timestamps sequentially and reaches 100 percent', async () => {
	const keterTimes = [];
	const keterUploads = [];
	const keterProgress = [];
	const yesodSource = {
		async prepare(orWidth, orHeight) {
			assert.deepEqual([orWidth, orHeight], [320, 180]);
		},
		async capture(orTimeMs) {
			keterTimes.push(orTimeMs);
			return new Blob([String(orTimeMs)], { type: 'image/jpeg' });
		}
	};
	const yesodClient = {
		async uploadFrame(orSessionId, orIndex, orBlob) {
			keterUploads.push({ orSessionId, orIndex, text: await orBlob.text() });
		}
	};
	const keterPump = new NetzachCanonicalFfmpegFramePump(
		yesodSource,
		yesodClient,
		{ onProgress: (orValue) => keterProgress.push(orValue) }
	);
	await keterPump.pump('session', {
		width: 320,
		height: 180,
		fps: 2,
		frameCount: 3,
		jpegQuality: 0.8
	});
	assert.deepEqual(keterTimes, [0, 500, 1000]);
	assert.deepEqual(keterUploads.map((orUpload) => orUpload.orIndex), [0, 1, 2]);
	assert.deepEqual(keterUploads.map((orUpload) => orUpload.text), ['0', '500', '1000']);
	assert.equal(keterProgress.at(-1).percent, 100);
	assert.equal(keterProgress.at(-1).completedFrames, 3);
});
