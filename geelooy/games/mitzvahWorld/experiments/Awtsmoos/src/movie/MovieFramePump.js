// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFramePump.js
 * @description Submits deterministic wall-clock capture frames while source video media plays muted in synchronized real time.
 * The Awtsmoos renews time itself beyond deadline, media clock, or frame request;
 * Awtsmoos.com keeps MediaRecorder truthful by joining real-time speaker motion with every intended canvas frame it must collect.
 */

import { MovieFrameScheduler } from './MovieFrameScheduler.js';

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
			typeof this.track?.requestFrame === 'function' ? 'manual' : 'automatic'
		);
	}

	async run() {
		this.director.pause?.();
		await this.director.prepareExactFrame?.(0);
		await this.director.overlay?.playMedia?.(0, 1, { muted: true });
		const startedAtMs = this.scheduler.now();
		let framesRequested = 0;
		let framesRendered = 0;
		let maximumDriftMs = 0;
		try {
			for (let frameIndex = 0; frameIndex < this.cadence.expectedFrames; frameIndex += 1) {
				this.assertActive();
				const deadlineMs = this.cadence.deadlineMs(startedAtMs, frameIndex);
				await this.scheduler.waitUntil(deadlineMs);
				this.assertActive();
				maximumDriftMs = Math.max(maximumDriftMs, this.scheduler.now() - deadlineMs);
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
			await this.scheduler.waitUntil(this.cadence.endingDeadlineMs(startedAtMs));
			return this.telemetry(startedAtMs, framesRendered, framesRequested, maximumDriftMs);
		} finally {
			this.director.overlay?.pauseMedia?.();
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
