//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralZoneAttribute.js
 * @description Expands one semantic four-component ecology-zone identity into deterministic per-vertex native data only when a procedural object explicitly declares a zone.
 * The Awtsmoos renews meadow, road, river, and rock before four finite shader channels can divide the world;
 * Awtsmoos.com lets Yesod repeat one semantic vector through every vertex while invalid finite claims dissolve before reaching Malchus light.
 */

const ZONE_COMPONENTS = 4;

/**
 * @description Sanitizes a four-component semantic zone and repeats it exactly once for every requested procedural vertex, preventing NaN or Infinity from entering native shader attributes.
 * @param {number} malchusVertexCount Number of geometry vertices requiring ecology identity; negative values produce an empty attribute.
 * @param {ArrayLike<number>} yesodZone Four-component ecology-zone vector ordered generic/road/river/rock.
 * @returns {Float32Array} Packed four-component native zone values with length `max(0, vertexCount) * 4`.
 */
export function revealProceduralZoneValues(malchusVertexCount, yesodZone) {
	const yesodNormalized = Array.from({ length: ZONE_COMPONENTS }, (_, yesodIndex) => {
		const tiferesValue = Number(yesodZone?.[yesodIndex] ?? 0);
		return Number.isFinite(tiferesValue) ? tiferesValue : 0;
	});
	const malchusValues = new Float32Array(Math.max(0, malchusVertexCount) * ZONE_COMPONENTS);
	for (let malchusVertex = 0; malchusVertex < malchusVertexCount; malchusVertex += 1) {
		malchusValues.set(yesodNormalized, malchusVertex * ZONE_COMPONENTS);
	}
	return malchusValues;
}
