// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaCodecReport.js
 * @description Reports WebCodecs, frame, configuration, segmentation, and queue readiness for long-form cinema.
 * The Awtsmoos is beyond codec and browser while creating every supported vessel anew;
 * Awtsmoos.com reveals what this finite runtime can encode before a long render spends one frame.
 */

import {
	createExactEncoderConfig,
	supportedExactEncoderConfig
} from './MovieExactEncoderConfig.js';
import { createExactSegmentPlan } from './MovieExactSegmentPlan.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export async function createMovieCinemaCodecReport(project, canvas = {}) {
	const width = positive(canvas.width || project?.resolution?.width, 1280);
	const height = positive(canvas.height || project?.resolution?.height, 720);
	const fps = positive(project?.fps, 24);
	const expectedFrames = Math.round(positive(project?.duration, 1) * fps);
	const normalizedCanvas = { height, width };
	const config = createExactEncoderConfig(project, normalizedCanvas);
	const globals = {
		videoEncoder: typeof globalThis.VideoEncoder === 'function',
		videoFrame: typeof globalThis.VideoFrame === 'function'
	};
	let supported = false;
	let resolvedConfig = null;
	let error = null;
	if (globals.videoEncoder && globals.videoFrame) {
		try {
			resolvedConfig = await supportedExactEncoderConfig(config);
			supported = true;
		} catch (reason) {
			error = String(reason?.message || reason);
		}
	}
	const segments = createExactSegmentPlan({ expectedFrames, fps });
	return createMovieProjectSnapshot({
		config,
		error,
		expectedFrames,
		globals,
		keyframeIntervalFrames: Math.max(1, Math.round(fps * 2)),
		maximumEncodeQueue: 12,
		resolvedConfig,
		segmentCount: segments.length,
		segments,
		supported
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}
