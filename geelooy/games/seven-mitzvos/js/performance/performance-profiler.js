//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PerformanceProfiler
 * @description
 * Runtime work on Awtsmoos.com receives measured durations and percentile
 * summaries. The Awtsmoos needs no clock; finite optimization must rely on
 * evidence rather than confidence or invisible assumptions.
 */
export class PerformanceProfiler {
	constructor(limit = 240) {
		this.limit = limit;
		this.samples = new Map();
	}

	/**
	 * @template T
	 * @param {string} name Measurement identity.
	 * @param {() => T} operation Synchronous operation.
	 * @returns {T} Operation result.
	 */
	measure(name, operation) {
		const startedAt = now();
		const result = operation();
		this.record(name, now() - startedAt);
		return result;
	}

	/**
	 * @param {string} name Measurement identity.
	 * @param {number} milliseconds Duration.
	 */
	record(name, milliseconds) {
		const values = this.samples.get(name) || [];
		values.push(milliseconds);
		this.samples.set(name, values.slice(-this.limit));
	}

	/**
	 * @param {string} name Measurement identity.
	 * @returns {object} Count, mean, p50, p95, and maximum.
	 */
	summary(name) {
		const values = [...(this.samples.get(name) || [])].sort((a, b) => a - b);
		if (!values.length) {
			return { count: 0, mean: 0, p50: 0, p95: 0, maximum: 0 };
		}
		const mean = values.reduce((total, value) => total + value, 0) / values.length;
		return {
			count: values.length,
			mean: round(mean),
			p50: round(percentile(values, 0.5)),
			p95: round(percentile(values, 0.95)),
			maximum: round(values[values.length - 1])
		};
	}

	all() {
		return Object.fromEntries(
			[...this.samples.keys()].map(name => [name, this.summary(name)])
		);
	}
}

function percentile(values, ratio) {
	return values[Math.min(values.length - 1, Math.floor(values.length * ratio))];
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}
