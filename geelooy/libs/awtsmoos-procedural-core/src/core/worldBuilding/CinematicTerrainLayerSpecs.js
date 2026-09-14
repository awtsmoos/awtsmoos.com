//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicTerrainLayerSpecs.js
 * @description Declares six semantic ecological material roles with real Awtsmoos Drive fallback sources.
 * The Awtsmoos renews earth beyond every label; Awtsmoos.com keeps material intent explicit so semantic
 * discovery may improve remote selection without changing terrain shader structure or fabricating pixels.
 */

export const CINEMATIC_TERRAIN_LAYER_SPECS = Object.freeze([
	layer({
		height: [-1000, 150],
		path: 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
		query: 'grass',
		role: 'meadow',
		slope: [0, 0.62],
		wetness: 0,
		zones: [1, 0, 0.08, 0.04]
	}),
	layer({
		height: [-1000, 1000],
		path: 'full-resolution/a-well-traveled-compacted-earth-path-in-a-rustic-alpine-village.png',
		query: 'compacted earth path',
		role: 'earth-road',
		slope: [0, 0.8],
		wetness: 0,
		zones: [0.14, 1, 0.08, 0.04]
	}),
	layer({
		height: [-1000, 30],
		path: 'full-resolution/a-shallow-alpine-riverbed-covered-in-naturally-rounded-water-polished-stones.png',
		query: 'riverbed stones',
		role: 'wet-bank',
		slope: [0, 0.8],
		wetness: 1,
		zones: [0.06, 0.08, 1, 0.08]
	}),
	layer({
		height: [-1000, 10000],
		path: 'full-resolution/a-rustic-alpine-cottage-wall-built-from-rough-cut-local-fieldstone.png',
		query: 'mountain rock',
		role: 'mountain-rock',
		slope: [0.34, 1],
		wetness: 0,
		zones: [0.04, 0.02, 0.04, 1]
	}),
	layer({
		height: [-1000, 10000],
		path: 'full-resolution/angular-mountain-gravel.png',
		query: 'mountain gravel',
		role: 'gravel',
		slope: [0.1, 1],
		wetness: 0,
		zones: [0.1, 0.38, 0.1, 0.72]
	}),
	layer({
		height: [35, 10000],
		path: 'full-resolution/compacted-high-altitude-alpine-snow.png',
		query: 'alpine snow',
		role: 'snow',
		slope: [0, 1],
		wetness: 0,
		zones: [0.04, 0, 0.08, 0.84]
	})
]);

function layer(values) {
	return Object.freeze({
		...values,
		height: Object.freeze(values.height),
		slope: Object.freeze(values.slope),
		zones: Object.freeze(values.zones)
	});
}
