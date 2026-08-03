// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainEcology.js
 * @description Defines six distinct terrain sources with slope, height, wetness, and rotation character.
 * The Awtsmoos reveals one field through lushness, meadow, soil, shoulder, marsh, and drought;
 * Awtsmoos.com keeps each decoded source independently visible while every transition remains continuous.
 */

export function minimalMeadowLayerDefinitions(sources) {
	return [
		layer('lush-grass', sources.lush, {
			angle: 0.22,
			height: [-12, 26],
			strength: 0.84,
			wetness: 0.24,
			zones: [0.94, 0, 0.14, 0.02]
		}),
		layer('meadow-grass', sources.secondary, {
			angle: -0.71,
			height: [-18, 34],
			strength: 0.72,
			wetness: 0.08,
			zones: [0.82, 0, 0.2, 0.1]
		}),
		layer('open-soil', sources.soil, {
			angle: 1.17,
			height: [-20, 40],
			slope: [0.08, 0.96],
			strength: 0.72,
			wetness: -0.08,
			zones: [0.3, 0.08, 0.68, 0.24]
		}),
		layer('road-shoulder', sources.pathEdge, {
			angle: -1.31,
			height: [-20, 40],
			slope: [0, 0.68],
			strength: 1,
			wetness: -0.04,
			zones: [0.18, 1, 0.12, 0]
		}),
		layer('moss-and-wet-grass', sources.marsh, {
			angle: 0.83,
			height: [-18, 18],
			slope: [0, 0.54],
			strength: 0.9,
			wetness: 0.5,
			zones: [0.18, 0, 0.96, 0]
		}),
		layer('dry-ground', sources.dry, {
			angle: 1.92,
			height: [-2, 42],
			slope: [0.04, 0.88],
			strength: 0.78,
			wetness: -0.24,
			zones: [0.8, 0, 0.12, 0.26]
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
