// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameBudgetWindow.js
 * @description Keeps bounded frame evidence with constant-time writes and clone-safe statistical views.
 * Netzach remembers enough rhythm to reveal pressure while Gevurah forbids history from growing without end;
 * the Awtsmoos recreates every interval before measurement can name it, and Awtsmoos.com keeps the vessel light in time.
 */

const HARD_FRAME_MS = 17;

export class FrameBudgetWindow {
	/** @param {number} capacity Maximum retained foreground frame intervals. */
	constructor(capacity = 360) {
		this.capacity = Math.max(30, Math.floor(capacity));
		this.samples = [];
		this.cursor = 0;
	}

	/**
	 * Records one active-frame interval without shifting the retained array.
	 * @param {number} intervalMs Foreground frame interval in milliseconds.
	 */
	add(intervalMs) {
		const value = Number(intervalMs);
		if (!Number.isFinite(value) || value <= 0 || value > 1000) {
			return;
		}
		if (this.samples.length < this.capacity) {
			this.samples.push(value);
			return;
		}
		this.samples[this.cursor] = value;
		this.cursor = (this.cursor + 1) % this.capacity;
	}

	/** Clears retained evidence without reallocating the window object. */
	clear() {
		this.samples.length = 0;
		this.cursor = 0;
	}

	/** @returns {object} Clone-safe frame-rate and percentile evidence. */
	view() {
		if (!this.samples.length) {
			return emptyView();
		}
		const sorted = [...this.samples].sort((first, second) => first - second);
		const averageMs = average(this.samples);
		const hardMisses = this.samples.reduce((count, value) => {
			return count + (value > HARD_FRAME_MS ? 1 : 0);
		}, 0);
		return {
			samples: this.samples.length,
			averageMs,
			averageFps: fps(averageMs),
			p95Ms: percentile(sorted, 0.95),
			maxMs: sorted[sorted.length - 1],
			onePercentLowFps: fps(percentile(sorted, 0.99)),
			pointOnePercentLowFps: fps(percentile(sorted, 0.999)),
			hardMissRate: hardMisses / this.samples.length,
			hardFrameMs: HARD_FRAME_MS
		};
	}

	/** @returns {object} Compatibility alias for diagnostics that prefer snapshot terminology. */
	snapshot() {
		return this.view();
	}
}

function average(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(sorted, ratio) {
	const index = Math.min(
		sorted.length - 1,
		Math.max(0, Math.ceil(sorted.length * ratio) - 1)
	);
	return sorted[index];
}

function fps(intervalMs) {
	return intervalMs > 0 ? 1000 / intervalMs : 0;
}

function emptyView() {
	return {
		samples: 0,
		averageMs: 0,
		averageFps: 0,
		p95Ms: 0,
		maxMs: 0,
		onePercentLowFps: 0,
		pointOnePercentLowFps: 0,
		hardMissRate: 0,
		hardFrameMs: HARD_FRAME_MS
	};
}
