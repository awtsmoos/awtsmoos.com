// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaCodecReport.test.mjs
 * @description Proves cinema reports browser WebCodecs support, queue bounds, keyframe cadence, and four long-form segments.
 * The Awtsmoos renews browser and codec before support is measured; Awtsmoos.com verifies
 * finite configuration honestly while keeping exact frame, queue, and segment obligations visible.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieCinemaCodecReport } from '../../movie/MovieCinemaCodecReport.js';
import { createMovieCinemaFlagship } from '../../movie/MovieCinemaFlagship.js';
import { compileMovieAgentManifest } from '../../movie/MovieAgentCompiler.js';

test('codec report negotiates one-minute VP8 WebCodecs configuration', async () => {
	const priorEncoder = globalThis.VideoEncoder;
	const priorFrame = globalThis.VideoFrame;
	globalThis.VideoEncoder = class {
		static async isConfigSupported(config) {
			return { config, supported: true };
		}
	};
	globalThis.VideoFrame = class {};
	try {
		const project = compileMovieAgentManifest(createMovieCinemaFlagship());
		const report = await createMovieCinemaCodecReport(project, project.resolution);
		assert.equal(report.supported, true);
		assert.equal(report.expectedFrames, 1440);
		assert.equal(report.segmentCount, 4);
		assert.equal(report.keyframeIntervalFrames, 48);
		assert.equal(report.maximumEncodeQueue, 12);
		assert.equal(report.config.codec, 'vp8');
		assert.deepEqual(report.segments.map(segment => segment.encodedFrames), [360, 360, 360, 360]);
	} finally {
		globalThis.VideoEncoder = priorEncoder;
		globalThis.VideoFrame = priorFrame;
	}
});

test('codec report explains missing browser WebCodecs globals', async () => {
	const priorEncoder = globalThis.VideoEncoder;
	const priorFrame = globalThis.VideoFrame;
	delete globalThis.VideoEncoder;
	delete globalThis.VideoFrame;
	try {
		const project = compileMovieAgentManifest(createMovieCinemaFlagship());
		const report = await createMovieCinemaCodecReport(project, project.resolution);
		assert.equal(report.supported, false);
		assert.deepEqual(report.globals, { videoEncoder: false, videoFrame: false });
	} finally {
		globalThis.VideoEncoder = priorEncoder;
		globalThis.VideoFrame = priorFrame;
	}
});
