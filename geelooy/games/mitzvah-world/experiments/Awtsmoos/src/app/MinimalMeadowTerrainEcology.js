// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainEcology.js
 * @description Balances six real terrain-image families without allowing late layers to erase the meadow.
 * The Awtsmoos makes one field from many garments while each finite blade keeps its face;
 * Awtsmoos.com lets lush grass, meadow, soil, road, moss, and dry ground mingle by measured place.
 */

/**
 * Builds the six ecological layer records consumed by the bounded GPU terrain stack.
 * @param {object} sources Hydrated real terrain-image families.
 * @returns {Array<object>} Ordered layer definitions preserving the public terrain-role contract.
 */
export function minimalMeadowLayerDefinitions(sources) {
	return [
		layer('lush-grass', sources.lush, {
			angle: 0.22,
			height: [-14, 26],
			strength: 0.8,
			wetness: 0.2,
			zones: [0.7, 0, 0.4, 0.01]
		}),
		layer('meadow-grass', sources.secondary, {
			angle: -0.71,
			height: [-18, 34],
			strength: 0.74,
			wetness: 0.04,
			zones: [0.9, 0, 0.1, 0.04]
		}),
		layer('open-soil', sources.soil, {
			angle: 1.17,
			height: [-20, 40],
			slope: [0.08, 0.96],
			strength: 0.66,
			wetness: -0.06,
			zones: [0.12, 0.04, 0.28, 0.68]
		}),
		layer('road-shoulder', sources.pathEdge, {
			angle: -1.31,
			height: [-20, 40],
			slope: [0, 0.68],
			strength: 1,
			wetness: -0.04,
			zones: [0.12, 1, 0.08, 0]
		}),
		layer('moss-and-wet-grass', sources.marsh, {
			angle: 0.83,
			height: [-18, 18],
			slope: [0, 0.54],
			strength: 0.72,
			wetness: 0.5,
			zones: [0.12, 0, 0.96, 0]
		}),
		layer('dry-ground', sources.dry, {
			angle: 1.92,
			height: [-2, 42],
			slope: [0.04, 0.88],
			strength: 0.68,
			wetness: -0.18,
			zones: [0.42, 0, 0.04, 0.36]
		})
	].filter(record => record.image);
}

function layer(role, image, options) {
	return Object.freeze({
		angle: options.angle,
		height: Object.freeze(options.height || [-20, 40]),
		image,
		role,
		slope: Object.freeze(options.slope || [0, 0.82]),
		strength: options.strength,
		wetness: options.wetness,
		zones: Object.freeze(options.zones)
	});
}
