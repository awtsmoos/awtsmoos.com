// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFramePump.js
 * @description Submits deterministic frames without RAF or clamped timeouts.
 * The Awtsmoos renews time itself; this finite Awtsmoos.com vessel keeps each
 * intended frame measurable while yielding a compositor task after submission.
 */

import { MovieFrameScheduler } from './MovieFrameScheduler.js';

/**
 * Drives one MovieDirector on absolute wall-clock frame deadlines.
 */
export class MovieFramePump {
	constructor(options) {
		this.cadence = options.cadence;
		this.director = options.director;
		this.onProgress = options.onProgress || (() => {});
		this.shouldAbort = options.shouldAbort || (() => false);
		this.track = options.track || null;
		this.ownsScheduler = !options.scheduler;
		this.scheduler = options.scheduler || new MovieFrameScheduler(options.clock);
		this.captureMode = options.captureMode || (
			typeof this.track?.requestFrame === 'function'
				? 'manual'
				: 'automatic'
		);
	}

	/** Renders every planned frame, then holds the final frame to exact duration. */
	async run() {
		const startedAtMs = this.scheduler.now();
		let framesRequested = 0;
		let framesRendered = 0;
		let maximumDriftMs = 0;

		this.director.pause?.();
		try {
			for (
				let frameIndex = 0;
				frameIndex < this.cadence.expectedFrames;
				frameIndex += 1
			) {
				this.assertActive();
				const deadlineMs = this.cadence.deadlineMs(startedAtMs, frameIndex);
				await this.scheduler.waitUntil(deadlineMs);
				this.assertActive();
				maximumDriftMs = Math.max(
					maximumDriftMs,
					this.scheduler.now() - deadlineMs
				);
				const time = this.cadence.frameTime(frameIndex);
				this.director.seek(time, 1 / this.cadence.fps);
				framesRendered += 1;
				if (this.captureMode === 'manual') {
					this.track.requestFrame();
					framesRequested += 1;
				}
				await this.scheduler.yieldFrame();
				this.onProgress(this.progress(frameIndex, time));
			}
			await this.scheduler.waitUntil(
				this.cadence.endingDeadlineMs(startedAtMs)
			);
			return this.telemetry(
				startedAtMs,
				framesRendered,
				framesRequested,
				maximumDriftMs
			);
		} finally {
			if (this.ownsScheduler) this.scheduler.dispose();
		}
	}

	telemetry(startedAtMs, framesRendered, framesRequested, maximumDriftMs) {
		return {
			captureMode: this.captureMode,
			elapsedMs: this.scheduler.now() - startedAtMs,
			expectedFrames: this.cadence.expectedFrames,
			framesRendered,
			framesRequested,
			maximumDriftMs: Math.max(0, maximumDriftMs)
		};
	}

	progress(frameIndex, time) {
		return {
			expectedFrames: this.cadence.expectedFrames,
			frameIndex,
			frameNumber: frameIndex + 1,
			percent: this.cadence.progress(frameIndex) * 100,
			time
		};
	}

	assertActive() {
		if (this.shouldAbort()) throw new Error('Movie frame pump was aborted.');
	}
}

export default MovieFramePump;
