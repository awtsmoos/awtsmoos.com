// B"H
// Boruch Hashem
// Blessed is He
/** @module EvidenceManifest @description Seals proof beside one release train. */

/** Creates a frozen evidence manifest from explicit receipts. */
export function createEvidenceManifest(input) {
	const trainId = String(input?.trainId || '').trim();
	const head = String(input?.head || '').trim();
	if (!trainId || !head) {
		throw new TypeError('Evidence manifest requires trainId and head.');
	}
	return deepFreeze({
		trainId,
		head,
		createdAt: String(input?.createdAt || new Date().toISOString()),
		sourceHashes: { ...(input?.sourceHashes || {}) },
		tests: [...(input?.tests || [])],
		screenshots: [...(input?.screenshots || [])],
		replays: [...(input?.replays || [])],
		runtimeProfiles: [...(input?.runtimeProfiles || [])],
		limitations: [...(input?.limitations || [])]
	});
}

function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}
	for (const child of Object.values(value)) {
		deepFreeze(child);
	}
	return Object.freeze(value);
}
