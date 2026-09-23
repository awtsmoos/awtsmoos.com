// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollRuntime
 * @description The Awtsmoos carries each verified RAF whisper through motion,
 * progress, and native scroll ownership while semantic pauses live in their own vessel.
 */
import {
	autoScrollTop,
	documentMax,
	setAutoScrollSmoothDisabled
} from './AutoScrollDocument.js';
import { AutoScrollBoundaryGate } from './AutoScrollBoundaryGate.js';
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
		this.motion = new AutoScrollMotion(() => this.semanticEngine.pixels);
		this.road = new AutoScrollRoadBuffer();
		this.boundary = new AutoScrollBoundaryGate(options.onBoundary);
		this.active = false;
		this.paused = false;
		this.frame = 0;
		this.lastFrameTime = 0;
		this.lastProgressTime = 0;
		this.savedScrollBehavior = null;
		this.step = this.step.bind(this);
	}

	start() {
		this.stop();
		this.active = true;
		this.savedScrollBehavior = setAutoScrollSmoothDisabled(true, null);
		this.recalibrate();
		this.road.request(true);
		this.frame = requestAutoScrollFrame(this.step);
	}

	step(frameTime) {
		if (!this.active) return;
		const wallTime = Date.now();
		const elapsed = this.lastFrameTime
			? Math.min((frameTime - this.lastFrameTime) / 1000, MAX_FRAME_SECONDS)
			: 0;
		this.lastFrameTime = frameTime;
		if (!this.paused) {
			this.boundary.release(wallTime);
			if (!this.boundary.active) this.move(elapsed, wallTime);
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

	move(elapsed, wallTime) {
		const before = autoScrollTop();
		const result = this.motion.advance(elapsed);
		if (!result.attempted) return;
		const after = autoScrollTop();
		this.road.noteMovement(result, after, documentMax(), wallTime);
		const crossing = this.semanticEngine.pauseForCrossing(before, after, wallTime);
		this.boundary.hold(crossing, wallTime);
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
		this.boundary.clear();
		this.motion.reset();
	}

	resume() {
		this.paused = false;
		this.lastFrameTime = 0;
	}

	stop() {
		this.active = false;
		this.paused = false;
		this.lastFrameTime = 0;
		this.lastProgressTime = 0;
		this.motion.reset();
		this.road.reset();
		this.boundary.clear();
		cancelAutoScrollFrame(this.frame);
		this.frame = 0;
		this.savedScrollBehavior = setAutoScrollSmoothDisabled(false, this.savedScrollBehavior);
	}
}
