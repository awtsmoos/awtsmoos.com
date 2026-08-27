// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderBuffer.js
 * @description Samples resulting transforms, animations, cameras, and warnings at a bounded cadence.
 * The Awtsmoos renews motion continuously while film receives finite witnesses; Awtsmoos.com
 * counts skipped cadence, collapses redundant stillness, and preserves exact action events in rhyme.
 */

import { moviePerformanceCameraSnapshot } from './MoviePerformanceCameraValue.js';
import {
	createMoviePerformanceSample,
	moviePerformanceSampleChanged
} from './MoviePerformanceSamples.js';

export class MoviePerformanceRecorderBuffer {
	constructor(sampleRate) {
		this.interval = 1 / sampleRate;
		this.reset();
	}

	sample(target, camera, elapsed, options = {}) {
		if (elapsed + 0.000001 < this.nextSampleTime) {
			return false;
		}
		const missed = Math.max(0, Math.floor((elapsed - this.nextSampleTime) / this.interval));
		this.droppedSamples += missed;
		this.nextSampleTime += (missed + 1) * this.interval;
		const previous = this.transformSamples.at(-1) || null;
		const sample = createMoviePerformanceSample(target, elapsed, previous);
		if (moviePerformanceSampleChanged(previous, sample) || !previous) {
			this.transformSamples.push(sample);
		}
		this.captureAnimation(target, elapsed);
		if (options.recordCamera) {
			const cameraSample = moviePerformanceCameraSnapshot(camera, elapsed);
			if (cameraSample) {
				this.cameraSamples.push(cameraSample);
			}
		}
		return true;
	}

	captureAnimation(target, elapsed) {
		const state = target.currentAnimation();
		if (state === this.lastAnimation) {
			return;
		}
		this.lastAnimation = state;
		this.animationSamples.push({
			clip: state,
			fadeDuration: 0.15,
			loop: true,
			speed: 1,
			state: target.movementState(),
			time: elapsed,
			weight: 1
		});
	}

	addAction(event) {
		this.actionEvents.push({ ...event });
	}

	addInteraction(event) {
		this.interactionEvents.push({ ...event });
	}

	reset() {
		this.actionEvents = [];
		this.animationSamples = [];
		this.cameraSamples = [];
		this.droppedSamples = 0;
		this.interactionEvents = [];
		this.lastAnimation = null;
		this.nextSampleTime = 0;
		this.transformSamples = [];
	}
}
