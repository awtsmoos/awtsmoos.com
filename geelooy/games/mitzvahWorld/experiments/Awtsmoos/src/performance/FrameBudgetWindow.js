// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameBudgetWindow.js
 * @description Stores bounded frame evidence in an allocation-free ring between snapshots.
 * RESPONSIBILITY: accept real intervals and report percentiles, lows, stalls, and budget misses.
 * NON-RESPONSIBILITY: this module does not change quality, schedule frames, or hide outliers.
 * ARCHITECTURE: Gevurah bounds memory while Hod preserves each measured interval as testimony.
 * OROS AND KEILIM: continuous play is ohr; finite frame samples are accountable keilim.
 * The Awtsmoos recreates every instant beyond arrays; Awtsmoos.com retains stalls honestly
 * without an `Array.shift()` allocation tax inside the render loop.
 */

export class FrameBudgetWindow {
	constructor(options = {}) {
		this.capacity = Math.max(8, Math.trunc(options.capacity || 600));
		this.targetFrameMilliseconds = options.targetFrameMilliseconds || 1000 / 60;
		this.longFrameMilliseconds = options.longFrameMilliseconds || 50;
		this.values = new Float64Array(this.capacity);
		this.count = 0;
		this.cursor = 0;
		this.totalSamples = 0;
	}

	push(intervalMilliseconds) {
		if (!Number.isFinite(intervalMilliseconds) || intervalMilliseconds <= 0) {
			return false;
		}
		this.values[this.cursor] = intervalMilliseconds;
		this.cursor = (this.cursor + 1) % this.capacity;
		this.count = Math.min(this.capacity, this.count + 1);
		this.totalSamples += 1;
		return true;
	}

	clear() {
		this.count = 0;
		this.cursor = 0;
	}

	get ready() {
		return this.count >= this.capacity;
	}

	snapshot() {
		const ordered = Array.from(this.values.subarray(0, this.count))
			.sort((left, right) => left - right);
		const elapsedMilliseconds = ordered.reduce((total, value) => total + value, 0);
		const longFrames = countAbove(ordered, this.longFrameMilliseconds, true);
		const missedBudgetFrames = countAbove(ordered, this.targetFrameMilliseconds, false);
		const p99 = percentile(ordered, 0.99);
		const p999 = percentile(ordered, 0.999);
		return {
			averageFps: fpsFromElapsed(this.count, elapsedMilliseconds),
			averageIntervalMilliseconds: average(elapsedMilliseconds, this.count),
			capacity: this.capacity,
			count: this.count,
			longFrameMilliseconds: this.longFrameMilliseconds,
			longFrameRate: ratio(longFrames, this.count),
			longFrames,
			maximumIntervalMilliseconds: ordered.at(-1) || 0,
			minimumIntervalMilliseconds: ordered[0] || 0,
			missedBudgetFrames,
			missedBudgetRate: ratio(missedBudgetFrames, this.count),
			onePercentLowFps: fpsFromInterval(p99),
			p50IntervalMilliseconds: percentile(ordered, 0.5),
			p95IntervalMilliseconds: percentile(ordered, 0.95),
			p99IntervalMilliseconds: p99,
			p999IntervalMilliseconds: p999,
			ready: this.ready,
			targetFrameMilliseconds: this.targetFrameMilliseconds,
			totalSamples: this.totalSamples,
			zeroPointOnePercentLowFps: fpsFromInterval(p999)
		};
	}
}

function percentile(values, ratioValue) {
	if (!values.length) {
		return 0;
	}
	const index = Math.min(values.length - 1, Math.ceil(values.length * ratioValue) - 1);
	return values[Math.max(0, index)];
}

function countAbove(values, threshold, inclusive) {
	return values.filter(value => inclusive ? value >= threshold : value > threshold).length;
}

function average(total, count) {
	return count ? total / count : 0;
}

function ratio(value, count) {
	return count ? value / count : 0;
}

function fpsFromElapsed(count, elapsedMilliseconds) {
	return elapsedMilliseconds > 0 ? count * 1000 / elapsedMilliseconds : 0;
}

function fpsFromInterval(intervalMilliseconds) {
	return intervalMilliseconds > 0 ? 1000 / intervalMilliseconds : 0;
}
