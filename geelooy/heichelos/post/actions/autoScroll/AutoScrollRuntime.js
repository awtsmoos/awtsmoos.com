// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollRuntime
 * @description The Awtsmoos preserves the verified subpixel RAF river while
 * semantic density, boundaries, estimates, and deferred road guide each frame.
 */
import { autoScrollTop, documentMax } from './AutoScrollDocument.js';
import { cancelAutoScrollFrame, requestAutoScrollFrame } from './AutoScrollFrameClock.js';
import { AutoScrollMotion } from './AutoScrollMotion.js';
import { AutoScrollRoadBuffer } from './AutoScrollRoadBuffer.js';
const MAX_FRAME_SECONDS = 0.05;
const PROGRESS_INTERVAL_MS = 500;

export class AutoScrollRuntime {
	constructor(options) {
		this.semanticEngine = options.semanticEngine;
		this.onEnd = options.onEnd ?? (() => {});
		this.onProgress = options.onProgress ?? (() => {});
		this.onBoundary = options.onBoundary ?? (() => {});
		this.motion = new AutoScrollMotion(() => this.semanticEngine.pixels);
		this.road = new AutoScrollRoadBuffer();
		this.active = false;
		this.paused = false;
		this.frame = 0;
		this.lastFrameTime = 0;
		this.lastProgressTime = 0;
		this.holdUntil = 0;
		this.step = this.step.bind(this);
	}
	start() {
		this.stop();
		this.active = true;
		this.recalibrate();
		this.road.request(true);
		globalThis.document?.documentElement?.style?.setProperty('scroll-behavior', 'smooth');
		this.frame = requestAutoScrollFrame(this.step);
	}
	step(frameTime) {
		if (!this.active) {
			return;
		}
		const wallTime = Date.now();
		const elapsed = this.lastFrameTime
			? Math.min((frameTime - this.lastFrameTime) / 1000, MAX_FRAME_SECONDS)
			: 0;
		this.lastFrameTime = frameTime;
		if (!this.paused) {
			this.releaseBoundary(wallTime);
			if (!this.holdUntil) {
				this.move(elapsed, wallTime);
			}
		}
		if (wallTime - this.lastProgressTime >= PROGRESS_INTERVAL_MS) {
			this.emitProgress(wallTime);
		}
		const maximum = documentMax();
		if (maximum > 0 && autoScrollTop() >= maximum - 2) {
			this.stop();
			this.onEnd();
			return;
		}
		this.frame = requestAutoScrollFrame(this.step);
	}
	releaseBoundary(wallTime) {
		if (this.holdUntil && wallTime >= this.holdUntil) {
			this.holdUntil = 0;
			this.onBoundary(null);
		}
	}
	move(elapsed, wallTime) {
		const before = autoScrollTop();
		const result = this.motion.advance(elapsed);
		if (!result.attempted) {
			return;
		}
		const after = autoScrollTop();
		this.road.noteMovement(result, after, documentMax(), wallTime);
		const boundary = this.semanticEngine.pauseForCrossing(before, after, wallTime);
		if (boundary?.pauseMs > 0) {
			this.holdUntil = wallTime + boundary.pauseMs;
			this.onBoundary(boundary);
		}
	}
	emitProgress(now = Date.now()) {
		this.lastProgressTime = now;
		this.onProgress(this.semanticEngine.progress(autoScrollTop(), documentMax(), now));
	}
	recalibrate() {
		this.semanticEngine.calibrate(autoScrollTop(), Date.now());
		this.emitProgress();
	}
	pause() {
		this.paused = true;
		this.holdUntil = 0;
		this.motion.reset();
		this.onBoundary(null);
	}
	resume() {
		this.paused = false;
		this.lastFrameTime = 0;
	}
	stop() {
		this.active = false;
		this.paused = false;
		this.holdUntil = 0;
		this.lastFrameTime = 0;
		this.lastProgressTime = 0;
		this.motion.reset();
		this.road.reset();
		this.onBoundary(null);
		cancelAutoScrollFrame(this.frame);
		this.frame = 0;
	}
}
