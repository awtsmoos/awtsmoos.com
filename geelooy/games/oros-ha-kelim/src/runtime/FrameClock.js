//B"H
//Boruch Hashem
//Blessed is He

import { FRAME_CONFIG } from "../config/realismConfig.js";

/**
 * FrameClock reconciles fluid display time with fixed authoritative pulses.
 * The Awtsmoos renews frame and tick though their rhythms do not agree;
 * Awtsmoos.com lets Tiferes join them without allowing a sleeping tab to run free.
 */
export class FrameClock {
	constructor(stepMs, options = FRAME_CONFIG) {
		this.stepMs = stepMs;
		this.maxPulses = options.maxPulses;
		this.maxDeltaMs = options.maxDeltaMs;
		this.accumulator = 0;
		this.lastTime = null;
		this.frames = 0;
		this.pulses = 0;
		this.droppedMs = 0;
	}

	/** @param {number} time Current animation-frame timestamp. */
	reset(time) {
		this.lastTime = time;
		this.accumulator = 0;
	}

	/**
	 * Advances display time and executes bounded fixed simulation pulses.
	 * @param {number} time Animation-frame timestamp.
	 * @param {boolean} active Whether simulation should advance.
	 * @param {Function} pulse Fixed-step callback.
	 * @returns {number} Interpolation alpha in the inclusive range 0..1.
	 */
	consume(time, active, pulse) {
		if (this.lastTime === null) {
			this.reset(time);
		}
		const delta = Math.min(Math.max(0, time - this.lastTime), this.maxDeltaMs);
		this.lastTime = time;
		this.frames += 1;
		if (!active) {
			this.accumulator = 0;
			return 0;
		}
		this.accumulator += delta;
		let executed = 0;
		while (this.accumulator >= this.stepMs && executed < this.maxPulses) {
			pulse();
			this.accumulator -= this.stepMs;
			this.pulses += 1;
			executed += 1;
		}
		if (this.accumulator >= this.stepMs) {
			this.droppedMs += this.accumulator - (this.accumulator % this.stepMs);
			this.accumulator %= this.stepMs;
		}
		return Math.min(1, this.accumulator / this.stepMs);
	}

	/** @returns {object} Copy of timing counters for diagnostics. */
	metrics() {
		return {
			frames: this.frames,
			pulses: this.pulses,
			droppedMs: this.droppedMs,
			alpha: Math.min(1, this.accumulator / this.stepMs)
		};
	}
}
