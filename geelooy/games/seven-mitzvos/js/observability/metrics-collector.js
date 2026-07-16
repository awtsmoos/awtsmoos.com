//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MetricsCollector
 * @description
 * Awtsmoos.com records privacy-safe counts, durations, and anomaly summaries
 * without exporting personal memories or evidence. The Awtsmoos knows all;
 * finite operations observe only what is necessary for reliability.
 */
export class MetricsCollector {
	constructor() {
		this.counters = new Map();
		this.gauges = new Map();
		this.durations = new Map();
	}

	increment(name, amount = 1) {
		this.counters.set(name, (this.counters.get(name) || 0) + amount);
	}

	gauge(name, value) {
		if (!Number.isFinite(value)) {
			throw new Error('MetricsCollector: gauge must be finite');
		}
		this.gauges.set(name, value);
	}

	duration(name, milliseconds) {
		const values = this.durations.get(name) || [];
		values.push(milliseconds);
		this.durations.set(name, values.slice(-120));
	}

	snapshot() {
		return {
			counters: Object.fromEntries(this.counters),
			gauges: Object.fromEntries(this.gauges),
			durations: Object.fromEntries(
				[...this.durations].map(([name, values]) => {
					return [name, summarize(values)];
				})
			)
		};
	}
}

function summarize(values) {
	const ordered = [...values].sort((a, b) => a - b);
	const mean = ordered.reduce((sum, value) => sum + value, 0) / ordered.length;
	return {
		count: ordered.length,
		mean: round(mean),
		p95: round(ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * 0.95))])
	};
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}
