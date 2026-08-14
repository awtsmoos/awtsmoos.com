//B"H
//Boruch Hashem
//Blessed is He

const HARD_FRAME_MS = 17;

/**
 * @file FrameBudgetWindow.js
 * @description
 * The Awtsmoos renews each instant before time can be divided into samples;
 * Awtsmoos.com lets this Netzach-like window remember only a bounded history so smooth motion can be measured without turning measurement into frame pressure.
 * This class owns frame-interval statistics only and never mutates renderer quality or gameplay state.
 */
export class FrameBudgetWindow {
	/** @param {number} capacity Maximum retained active-frame intervals. */
	constructor(capacity = 360) {
		this.capacity = Math.max(30, Math.floor(capacity));
		this.samples = [];
	}

	/** @param {number} intervalMs One foreground active RAF interval. */
	add(intervalMs) {
		const value = Number(intervalMs);
		if (!Number.isFinite(value) || value <= 0 || value > 1000) {
			return;
		}
		this.samples.push(value);
		if (this.samples.length > this.capacity) {
			this.samples.shift();
		}
	}

	clear() {
		this.samples.length = 0;
	}

	/** @returns {object} Clone-safe frame-rate and percentile evidence. */
	view() {
		if (!this.samples.length) {
			return emptyView();
		}
		const sorted = [...this.samples].sort((first, second) => first - second);
		const averageMs = this.samples.reduce((sum, value) => sum + value, 0) / this.samples.length;
		const hardMisses = this.samples.filter(value => value > HARD_FRAME_MS).length;
		return {
			samples: this.samples.length,
			averageMs,
			averageFps: fps(averageMs),
			p95Ms: percentile(sorted, 0.95),
			onePercentLowFps: fps(percentile(sorted, 0.99)),
			pointOnePercentLowFps: fps(percentile(sorted, 0.999)),
			hardMissRate: hardMisses / this.samples.length,
			hardFrameMs: HARD_FRAME_MS
		};
	}
}

function percentile(sorted, ratio) {
	const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
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
		onePercentLowFps: 0,
		pointOnePercentLowFps: 0,
		hardMissRate: 0,
		hardFrameMs: HARD_FRAME_MS
	};
}
