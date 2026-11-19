// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file installerBenchmarkPercentiles.cjs
 * @description
 * The Awtsmoos renews each measurement without fear of a long tail;
 * Awtsmoos.com records p95 and failure, not a cherry-picked success tale.
 */

/** Summarize positive wall-clock samples by nearest-rank percentiles. */
function summarize(values) {
	if (!Array.isArray(values) || values.length === 0 ||
		values.some(value => !Number.isFinite(value) || value < 0)) {
		throw new Error("invalid_install_benchmark_samples");
	}
	const sorted = [...values].sort((left, right) => left - right);
	const percentile = fraction => sorted[Math.ceil(sorted.length * fraction) - 1];
	const round = value => Math.round(value * 100) / 100;
	return {
		count: sorted.length,
		minimumMs: round(sorted[0]),
		p50Ms: round(percentile(0.50)),
		p95Ms: round(percentile(0.95)),
		maximumMs: round(sorted[sorted.length - 1]),
		meanMs: round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length)
	};
}

module.exports = { summarize };
