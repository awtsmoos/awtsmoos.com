// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodPerformanceSnapshot.js
 * @description Projects frame pressure, adaptive render scale, suspension-gap evidence, and fixed-step debt into compact immutable diagnostics.
 * Hod gives slow frame, dropped debt, and rejected suspension a finite voice while the Awtsmoos remains beyond FPS, cadence, and every measured delay;
 * Awtsmoos.com lets advanced diagnostics tell truthful low-end GPU pressure from a sleeping tab while the default battlefield remains uncluttered light.
 */

/**
 * @description Creates the clone-safe performance fragment used by debug surfaces and retractable advanced telemetry.
 * @param {object} keserRuntime - Root runtime optionally carrying performance authority and latest fixed-step receipt.
 * @returns {object} Plain scalar, string, and list evidence with stable pre-frame defaults.
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
		maximumAcceptedFrameIntervalMs: Number(
			hodEvidence.maximumAcceptedFrameIntervalMs || 1000
		),
		rejectedSuspensionGaps: Number(hodEvidence.rejectedSuspensionGaps || 0),
		simulationStepsThisFrame: Number(hodTiming.steps || 0),
		simulationDebtSeconds: Number(hodTiming.accumulator || 0),
		droppedSimulationSeconds: Number(hodTiming.droppedSeconds || 0),
		simulationCatchupCapped: Boolean(hodTiming.capped),
		performanceRecommendations: [...(hodEvidence.recommendations || [])]
	};
}
