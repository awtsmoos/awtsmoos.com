// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseProbeMetrics.js
 * @description Evaluates the bounded release probe against the low-end frame and generation covenant.
 * The Awtsmoos renews every measured interval; Awtsmoos.com lets Gevurah reject a release when evidence is absent or a budget is crossed.
 */

const P95_LIMIT_MS = 16.7;
const GENERATION_LIMIT_MS = 4;
const LONG_FRAME_LIMIT_MS = 50;

/** Builds immutable frame statistics from raw intervals. */
export function summarizeReleaseFrames(frameMilliseconds = []) {
	const sorted = [...frameMilliseconds]
		.filter(Number.isFinite)
		.sort((first, second) => first - second);
	return Object.freeze({
		count: sorted.length,
		framesOver50Milliseconds: sorted.filter(value => value > LONG_FRAME_LIMIT_MS).length,
		medianMilliseconds: percentile(sorted, 0.5),
		p95Milliseconds: percentile(sorted, 0.95),
		worstMilliseconds: sorted.at(-1) ?? null
	});
}

/** Returns the fail-closed release-performance verdict. */
export function evaluateReleasePerformance(evidence) {
	const failures = [];
	if (!(evidence.frames?.count > 0)) failures.push('FRAME_SAMPLES_MISSING');
	if (!(evidence.frames?.p95Milliseconds <= P95_LIMIT_MS)) failures.push('FRAME_P95_OVER_16_7_MS');
	if ((evidence.frames?.framesOver50Milliseconds ?? Infinity) > 1) failures.push('REPEATED_FRAME_OVER_50_MS');
	if (!Number.isFinite(evidence.generationMaximumMilliseconds)) failures.push('GENERATION_SLICE_UNSUPPORTED');
	if (Number.isFinite(evidence.generationMaximumMilliseconds)
		&& evidence.generationMaximumMilliseconds > GENERATION_LIMIT_MS) {
		failures.push('GENERATION_SLICE_OVER_4_MS');
	}
	return Object.freeze({
		certified: failures.length === 0,
		failures: Object.freeze(failures),
		thresholds: Object.freeze({
			generationMaximumMilliseconds: GENERATION_LIMIT_MS,
			p95FrameMilliseconds: P95_LIMIT_MS,
			repeatedLongFrameMilliseconds: LONG_FRAME_LIMIT_MS
		})
	});
}

/** Returns a deterministic nearest-rank percentile for a sorted numeric list. */
function percentile(sorted, fraction) {
	if (!sorted.length) {
		return null;
	}
	const index = Math.max(0, Math.ceil(sorted.length * fraction) - 1);
	return sorted[index];
}
