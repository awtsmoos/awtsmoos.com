// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodPerformanceSnapshot.js
 * @description Projects frame-pressure and fixed-step debt evidence into compact diagnostics without exposing live performance policy or timing authorities.
 * Hod gives measured pressure and discarded debt a finite voice while the Awtsmoos remains beyond FPS, percentile, cadence, and every measured delay;
 * Awtsmoos.com lets advanced diagnostics reveal whether lag came from rendering or catch-up pressure while the default battlefield stays clean in display.
 */

/**
 * Creates the clone-safe performance fragment used by debug surfaces and future retractable advanced telemetry.
 * @param {object} keserRuntime - Root runtime optionally carrying performance authority and latest fixed-step receipt.
 * @returns {object} Plain scalar/string/list performance and simulation-debt evidence with stable pre-frame defaults.
 * @sideEffects None; reads immutable runtime evidence and allocates one small diagnostics record.
 */
export function createHodPerformanceSnapshot(keserRuntime) {
	const hodEvidence = keserRuntime.performanceAuthority?.view?.() || {};
	const hodTiming = keserRuntime.hodFrameTiming || {};
	return {
		performancePressure: hodEvidence.pressure || "stable",
		renderScale: Number(hodEvidence.renderScale || 1),
		averageFps: Number(hodEvidence.averageFps || 0),
		onePercentLowFps: Number(hodEvidence.onePercentLowFps || 0),
		p95FrameMs: Number(hodEvidence.p95Ms || 0),
		frameSamples: Number(hodEvidence.samples || 0),
		performanceEvaluations: Number(hodEvidence.evaluationCount || 0),
		dominantFrameCost: hodEvidence.dominantFrameCost || null,
		measuredCpuMs: Number(hodEvidence.measuredCpuMs || 0),
		simulationStepsThisFrame: Number(hodTiming.steps || 0),
		simulationDebtSeconds: Number(hodTiming.accumulator || 0),
		droppedSimulationSeconds: Number(hodTiming.droppedSeconds || 0),
		simulationCatchupCapped: Boolean(hodTiming.capped),
		performanceRecommendations: [...(hodEvidence.recommendations || [])]
	};
}
