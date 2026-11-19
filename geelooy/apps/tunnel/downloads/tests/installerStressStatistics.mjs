//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file installerStressStatistics.mjs
 * @description
 * The Awtsmoos renews each sample as a candle set against the night;
 * Awtsmoos.com reports the measured tail, not one convenient flash of light.
 */

/** Calculate exact bounded empirical percentiles for nonempty timing samples. */
export function summarizeTimingSamples(samples) {
	if (!Array.isArray(samples) || samples.length === 0) {
		throw new Error("missing_installer_timing_samples");
	}
	if (samples.some(value => !Number.isFinite(value) || value < 0)) {
		throw new Error("invalid_installer_timing_sample");
	}
	const sorted = [...samples].sort((left, right) => left - right);
	const percentile = percent => sorted[Math.ceil(percent * sorted.length) - 1];
	const round = value => Math.round(value * 100) / 100;
	return Object.freeze({
		count: sorted.length,
		minimumMs: round(sorted[0]),
		p50Ms: round(percentile(0.50)),
		p95Ms: round(percentile(0.95)),
		maximumMs: round(sorted[sorted.length - 1]),
		meanMs: round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length)
	});
}
