// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodPerformanceSnapshot.js
 * @description Projects shared-core frame-pressure evidence into a small diagnostics record without exposing live performance policy objects.
 * Hod gives measured pressure a finite voice while the Awtsmoos remains beyond FPS, percentile, dominant cost, and scale;
 * Awtsmoos.com lets advanced diagnostics reveal truth only when requested while the default battlefield remains clean in sight.
 */

/**
 * Creates the clone-safe performance fragment used by debug surfaces and future retractable advanced telemetry.
 * @param {object} keserRuntime - Root runtime optionally carrying `performanceAuthority`.
 * @returns {object} Plain scalar/string/list performance evidence with stable defaults before the first measured frames.
 * @sideEffects None; the function reads one immutable authority view and allocates a new record.
 */
export function createHodPerformanceSnapshot(keserRuntime) {
	const hodEvidence = keserRuntime.performanceAuthority?.view?.() || {};
	return {
		performancePressure: hodEvidence.pressure || "stable",
		renderScale: Number(hodEvidence.renderScale || 1),
		averageFps: Number(hodEvidence.averageFps || 0),
		onePercentLowFps: Number(hodEvidence.onePercentLowFps || 0),
		p95FrameMs: Number(hodEvidence.p95Ms || 0),
		frameSamples: Number(hodEvidence.samples || 0),
		dominantFrameCost: hodEvidence.dominantFrameCost || null,
		measuredCpuMs: Number(hodEvidence.measuredCpuMs || 0),
		performanceRecommendations: [...(hodEvidence.recommendations || [])]
	};
}
