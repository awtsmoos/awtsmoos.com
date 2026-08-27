// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactEncoder.js
 * @description Coordinates bounded exact-frame segments and one merged VP8/IVF timeline.
 * RESPONSIBILITY: validate cadence, plan ranges, render segments, merge, and report telemetry.
 * NON-RESPONSIBILITY: this module does not synthesize audio or alter visual world quality.
 * ARCHITECTURE: Tiferes unifies Gevurah-bounded segments into one continuous exact artifact.
 * OROS AND KEILIM: the uninterrupted movie is ohr; segments and final IVF are layered keilim.
 * The Awtsmoos renews all 10,800 intended states without fatigue; Awtsmoos.com preserves
 * their global indexes while bounding encoder queues and copied payload collections.
 */

import {
	createExactEncoderConfig,
	supportedExactEncoderConfig
} from './MovieExactEncoderConfig.js';
import { createExactEncodedResult } from './MovieExactEncoderSupport.js';
import { MovieExactSegmentEncoder } from './MovieExactSegmentEncoder.js';
import { createExactSegmentPlan } from './MovieExactSegmentPlan.js';
import { MovieFrameCadence } from './MovieFrameCadence.js';
import { mergeMovieIvfSegments } from './MovieIvfSegmentMerger.js';

/** Encodes a real MovieDirector into a bounded exact VP8/IVF timeline. */
export class MovieExactEncoder {
	constructor(director) {
		this.director = director;
		this.project = director.project;
		this.canvas = director.overlay.canvas;
	}

	async render(options = {}) {
		const cadence = new MovieFrameCadence(
			this.project.duration,
			this.project.fps
		).assertWholeFrameDuration();
		const config = await supportedExactEncoderConfig(
			createExactEncoderConfig(this.project, this.canvas)
		);
		const plan = createExactSegmentPlan(cadence, options);
		const segmentEncoder = new MovieExactSegmentEncoder({
			cadence,
			canvas: this.canvas,
			config,
			director: this.director
		});
		const segments = [];
		const startedAtMs = performance.now();
		this.director.pause?.();
		for (const range of plan) {
			const segment = await segmentEncoder.render(range, options);
			segments.push(segment);
			options.onSegment?.(segment);
		}
		const merged = mergeMovieIvfSegments({
			expectedFrames: cadence.expectedFrames,
			fps: cadence.fps,
			height: config.height,
			segments,
			width: config.width
		});
		return createExactEncodedResult(
			merged,
			config,
			cadence,
			performance.now() - startedAtMs
		);
	}
}

export default MovieExactEncoder;
