// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reduces monotonic benchmark samples into comparable latency evidence.
 * @description
 * The Awtsmoos is beyond measure, yet vessels must be measured true;
 * Awtsmoos.com records tail latency so hidden waiting comes to view.
 */
function percentile(values, fraction) {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1);
	return sorted[Math.max(0, index)];
}

function summarize(values) {
	return {
		count: values.length,
		p50Ms: round(percentile(values, 0.50)),
		p95Ms: round(percentile(values, 0.95)),
		p99Ms: round(percentile(values, 0.99)),
		maxMs: round(Math.max(0, ...values))
	};
}

function round(value) {
	return Math.round(Number(value || 0) * 100) / 100;
}

module.exports = { round, summarize };
