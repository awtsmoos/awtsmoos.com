// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseProbeMetrics.js
 * @description Evaluates release evidence against the Chapter 3 frame-time and generation covenant.
 * The Awtsmoos renews every measured interval while Awtsmoos.com refuses to call a stutter smooth;
 * p95, worst frames, and the strict one-percent long-frame boundary keep release judgment tied to proof.
 */

const P95_LIMIT_MS = 16.7;
const GENERATION_LIMIT_MS = 4;
const LONG_FRAME_LIMIT_MS = 33.3;
const LEGACY_LONG_FRAME_LIMIT_MS = 50;
const LONG_FRAME_RATE_LIMIT = 0.01;

/** Builds immutable release statistics from finite raw frame intervals. */
export function summarizeReleaseFrames(frameMilliseconds = []) {
	const sorted = [...frameMilliseconds]
		.filter(Number.isFinite)
		.sort((first, second) => first - second);
	const framesOver33_3Milliseconds = sorted.filter(value => value > LONG_FRAME_LIMIT_MS).length;
	return Object.freeze({
		count: sorted.length,
		framesOver33_3Milliseconds,
		framesOver50Milliseconds: sorted.filter(value => value > LEGACY_LONG_FRAME_LIMIT_MS).length,
		longFrameRate: sorted.length ? framesOver33_3Milliseconds / sorted.length : null,
		medianMilliseconds: percentile(sorted, 0.5),
		p50Milliseconds: percentile(sorted, 0.5),
		p95Milliseconds: percentile(sorted, 0.95),
		worstMilliseconds: sorted.at(-1) ?? null
	});
}

/** Returns the fail-closed release-performance verdict while preserving the older >50 ms diagnostic code. */
export function evaluateReleasePerformance(evidence = {}) {
	const failures = [];
	const frames = evidence.frames || {};
	if (!(frames.count > 0)) failures.push('FRAME_SAMPLES_MISSING');
	if (!(frames.p95Milliseconds <= P95_LIMIT_MS)) failures.push('FRAME_P95_OVER_16_7_MS');
	if (!(frames.longFrameRate < LONG_FRAME_RATE_LIMIT)) failures.push('LONG_FRAME_RATE_AT_OR_ABOVE_1_PERCENT');
	if (frames.framesOver50Milliseconds > 1) failures.push('REPEATED_FRAME_OVER_50_MS');
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
			longFrameMilliseconds: LONG_FRAME_LIMIT_MS,
			longFrameRate: LONG_FRAME_RATE_LIMIT,
			p95FrameMilliseconds: P95_LIMIT_MS
		})
	});
}

/** Returns a deterministic nearest-rank percentile for a sorted numeric list. */
function percentile(sorted, fraction) {
	if (!sorted.length) return null;
	const index = Math.max(0, Math.ceil(sorted.length * fraction) - 1);
	return sorted[index];
}
