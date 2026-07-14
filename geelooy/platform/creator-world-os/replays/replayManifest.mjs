// B"H
// Boruch Hashem
// Blessed is He
/** @module ReplayManifest @description Names deterministic replay inputs and runtime identity. */

/** Creates an immutable replay manifest. */
export function createReplayManifest(input) {
	const worldId = String(input?.worldId || '').trim();
	const runtimeVersion = String(input?.runtimeVersion || '').trim();
	const seed = String(input?.seed || '').trim();
	if (!worldId || !runtimeVersion || !seed) {
		throw new TypeError('Replay manifest requires worldId, runtimeVersion, and seed.');
	}
	return Object.freeze({
		id: input?.id || `replay:${worldId}:${seed}`,
		worldId,
		runtimeVersion,
		seed,
		characterIds: Object.freeze([...(input?.characterIds || [])]),
		startedAt: String(input?.startedAt || new Date().toISOString()),
		eventsHash: String(input?.eventsHash || ''),
		metadata: Object.freeze({ ...(input?.metadata || {}) })
	});
}
