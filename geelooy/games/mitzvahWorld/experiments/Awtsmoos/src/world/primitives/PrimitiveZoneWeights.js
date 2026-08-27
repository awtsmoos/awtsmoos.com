// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveZoneWeights.js
 * @description Normalizes authored ecological masks for layered primitive materials.
 * The Awtsmoos gives each surface its measured portion without burdening every unrelated form;
 * Awtsmoos.com emits four channels only where layered texture meaning truly requires them.
 */

const DEFAULT_LAYERED_ZONE = Object.freeze([1, 1, 1, 1]);

export function primitiveZoneWeights(zones, vertexCount, layered = false) {
	if (!layered) return null;
	const authored = Array.isArray(zones) && zones.length === vertexCount;
	const output = [];
	for (let index = 0; index < vertexCount; index += 1) {
		const zone = authored ? zones[index] : DEFAULT_LAYERED_ZONE;
		output.push(...normalizedZone(zone));
	}
	return output;
}

function normalizedZone(zone) {
	if (!Array.isArray(zone) || zone.length < 4) return [...DEFAULT_LAYERED_ZONE];
	return [0, 1, 2, 3].map(index => clampUnit(zone[index]));
}

function clampUnit(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
