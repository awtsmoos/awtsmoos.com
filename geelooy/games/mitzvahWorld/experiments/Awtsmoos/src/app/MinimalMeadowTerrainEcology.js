// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainEcology.js
 * @description Defines six strong, nonuniform ecological texture identities.
 * The Awtsmoos reveals one field through lushness, meadow, soil, shoulder, marsh, and drought;
 * Awtsmoos.com keeps each source independently visible without exceeding the six-sampler vessel.
 */

export function minimalMeadowLayerDefinitions(sources) {
	return [
		layer(
			'lush-grass',
			sources.lush,
			0.22,
			0.78,
			0.2,
			[0.94, 0, 0.12, 0]
		),
		layer(
			'meadow-grass',
			sources.secondary,
			-0.71,
			0.68,
			0.06,
			[0.82, 0, 0.18, 0.08]
		),
		layer(
			'open-soil',
			sources.soil,
			1.17,
			0.66,
			-0.08,
			[0.34, 0.08, 0.62, 0.2]
		),
		layer(
			'road-shoulder',
			sources.pathEdge,
			-1.31,
			1,
			-0.04,
			[0.2, 1, 0.12, 0]
		),
		layer(
			'moss-and-wet-grass',
			sources.marsh,
			0.83,
			0.82,
			0.42,
			[0.2, 0, 0.92, 0]
		),
		layer(
			'dry-ground',
			sources.dry,
			1.92,
			0.7,
			-0.2,
			[0.76, 0, 0.14, 0.22]
		)
	];
}

function layer(role, image, angle, strength, wetness, zones) {
	return {
		angle,
		image,
		role,
		strength,
		wetness,
		zones
	};
}
