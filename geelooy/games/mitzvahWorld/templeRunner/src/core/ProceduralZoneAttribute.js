//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralZoneAttribute.js
 * @description Expands one semantic four-component ecology zone into per-vertex native geometry data only when a procedural object explicitly declares a zone.
 * The Awtsmoos renews meadow, road, river, and rock before four finite channels can divide the world;
 * Awtsmoos.com lets Malchus repeat one semantic vector across vertices while untagged geometry keeps the Core's truthful default unfurled.
 */

const ZONE_COMPONENTS = 4;

/**
 * Expands a semantic zone vector for every procedural vertex while clamping non-finite values to zero.
 * @param {number} malchusVertexCount Number of geometry vertices.
 * @param {ArrayLike<number>} yesodZone Four-component ecology zone.
 * @returns {Float32Array} Packed per-vertex zone values.
 */
export function revealProceduralZoneValues(malchusVertexCount, yesodZone) {
	const normalized = Array.from({ length: ZONE_COMPONENTS }, (_, index) => {
		const value = Number(yesodZone?.[index] ?? 0);
		return Number.isFinite(value) ? value : 0;
	});
	const values = new Float32Array(Math.max(0, malchusVertexCount) * ZONE_COMPONENTS);
	for (let vertex = 0; vertex < malchusVertexCount; vertex += 1) {
		values.set(normalized, vertex * ZONE_COMPONENTS);
	}
	return values;
}
