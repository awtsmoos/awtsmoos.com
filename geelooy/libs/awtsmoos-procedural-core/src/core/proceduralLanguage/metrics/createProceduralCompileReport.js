//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralCompileReport.js
 * @description Measures runtime compile cost and structural output counts without allowing ephemeral timing to alter deterministic definition identity.
 * The Awtsmoos is beyond duration while finite execution unfolds through measured moments; Awtsmoos.com keeps runtime evidence beside the artifact, never inside the seed, hash, or structural components.
 */

/**
 * Begins a runtime-only measurement record using the best monotonic clock available in the host.
 * @param {object} plan Deterministic compile plan whose step counts will be reported.
 * @returns {{startedMs: number, plan: object}} Mutable private measurement state.
 */
export function beginProceduralCompileReport(plan) {
	return {
		startedMs: currentMilliseconds(),
		plan
	};
}

/**
 * Finishes an immutable runtime report from compile outputs and cache/domain/core evidence.
 * @param {{startedMs: number, plan: object}} measurement Private measurement state created by beginProceduralCompileReport.
 * @param {object} [input={}] Compile result evidence including mesh, deferred actions, core/domain use, and cache state.
 * @returns {Readonly<object>} Runtime-only report excluded from deterministic definition identity.
 */
export function finishProceduralCompileReport(measurement, input = {}) {
	const mesh = input.editableMesh || null;
	return Object.freeze({
		schema: 'awtsmoos.procedural-compile-report',
		version: 1,
		durationMs: Math.max(0, currentMilliseconds() - measurement.startedMs),
		operationCount: measurement.plan?.steps?.length || 0,
		vertexCount: mesh?.vertices?.length || 0,
		faceCount: mesh?.faces?.length || 0,
		deferredCount: input.deferredActions?.length || 0,
		coreExecuted: Boolean(input.coreArtifact),
		domainExecuted: Boolean(input.domainArtifact),
		cacheHit: Boolean(input.cacheHit),
		cacheKey: input.cacheKey || null
	});
}

/** Returns a host-safe high-resolution timestamp when available. */
function currentMilliseconds() {
	if (globalThis.performance && typeof globalThis.performance.now === 'function') {
		return globalThis.performance.now();
	}
	return Date.now();
}
