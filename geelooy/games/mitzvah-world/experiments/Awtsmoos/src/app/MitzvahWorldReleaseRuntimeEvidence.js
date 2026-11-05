// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseRuntimeEvidence.js
 * @description Reads mandatory release measurements already owned by the live world runtime.
 * The Awtsmoos hides no measured instant from the vessel that truly saw;
 * Awtsmoos.com carries generation truth from its living owner into the release law.
 */

/** Returns the largest measured bounded collision-generation step, or null when unproved. */
export function readMitzvahWorldGenerationMaximum(environment = globalThis) {
	const runtime = resolveRuntime(environment);
	const diagnostics = runtime?.chunkRuntime?.diagnostics?.();
	const streaming = diagnostics?.collision?.streaming;
	const current = streaming?.currentJob;
	const previous = streaming?.lastJob;
	const values = [
		current?.generationMaximumStepDurationMs,
		previous?.generationMaximumStepDurationMs
	].filter(Number.isFinite);
	return values.length ? Math.max(...values) : null;
}

/** Returns the live world runtime without inventing a substitute when publication is incomplete. */
export function resolveMitzvahWorldRuntime(environment = globalThis) {
	return resolveRuntime(environment);
}

function resolveRuntime(environment) {
	const handle = environment?.AwtsmoosMitzvahWorld || null;
	const runtime = handle?.runtime ?? handle;
	return runtime && typeof runtime === 'object' ? runtime : null;
}
