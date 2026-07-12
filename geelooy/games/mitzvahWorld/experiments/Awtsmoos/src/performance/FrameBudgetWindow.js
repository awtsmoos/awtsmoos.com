// B"H

/**
 * Holds a bounded window of real frame intervals. The window preserves stalls
 * rather than averaging them away, because one long silence is part of play.
 */
export class FrameBudgetWindow {
	constructor({
		capacity = 180,
		targetFrameMilliseconds = 1000 / 60,
		longFrameMilliseconds = 50
	} = {}) {
		this.capacity = Math.max(8, capacity | 0);
		this.targetFrameMilliseconds = targetFrameMilliseconds;
		this.longFrameMilliseconds = longFrameMilliseconds;
		this.values = [];
		this.totalSamples = 0;
	}

	push(intervalMilliseconds) {
		if (!Number.isFinite(intervalMilliseconds) || intervalMilliseconds <= 0) {
			return false;
		}
		this.values.push(intervalMilliseconds);
		this.totalSamples += 1;
		while (this.values.length > this.capacity) this.values.shift();
		return true;
	}

	clear() {
		this.values.length = 0;
	}

	get ready() {
		return this.values.length >= this.capacity;
	}

	snapshot() {
		const ordered = [...this.values].sort((left, right) => left - right);
		const count = ordered.length;
		const elapsedMilliseconds = sum(ordered);
		const longFrames = ordered.filter(
			(value) => value >= this.longFrameMilliseconds
		).length;
		const missedBudgetFrames = ordered.filter(
			(value) => value > this.targetFrameMilliseconds
		).length;
		return {
			count,
			capacity: this.capacity,
			ready: this.ready,
			totalSamples: this.totalSamples,
			averageIntervalMilliseconds: count ? elapsedMilliseconds / count : 0,
			averageFps: elapsedMilliseconds > 0 ? count * 1000 / elapsedMilliseconds : 0,
			p50IntervalMilliseconds: percentile(ordered, 0.5),
			p95IntervalMilliseconds: percentile(ordered, 0.95),
			p99IntervalMilliseconds: percentile(ordered, 0.99),
			maximumIntervalMilliseconds: ordered.at(-1) || 0,
			minimumIntervalMilliseconds: ordered[0] || 0,
			longFrames,
			longFrameRate: count ? longFrames / count : 0,
			missedBudgetFrames,
			missedBudgetRate: count ? missedBudgetFrames / count : 0,
			targetFrameMilliseconds: this.targetFrameMilliseconds,
			longFrameMilliseconds: this.longFrameMilliseconds
		};
	}
}

function percentile(orderedValues, ratio) {
	if (!orderedValues.length) return 0;
	const index = Math.max(
		0,
		Math.min(
			orderedValues.length - 1,
			Math.ceil(orderedValues.length * ratio) - 1
		)
	);
	return orderedValues[index];
}

function sum(values) {
	return values.reduce((total, value) => total + value, 0);
}
