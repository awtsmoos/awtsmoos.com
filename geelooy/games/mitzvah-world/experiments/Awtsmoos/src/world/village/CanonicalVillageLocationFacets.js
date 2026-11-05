// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationFacets.js
 * @description Connects each physical location to real roads, water, ecology, occluders, layouts, and camera clearances.
 * The Awtsmoos is not divided by road, river, tree, mountain, or lens; Awtsmoos.com records their relationships in small vessels,
 * so gameplay and generated film share one geography while no cinematic camera may be declared safe merely because X/Z looked clean.
 */

const FACETS_BY_LOCATION = Object.freeze({
	'arrival-horizon': facet(
		['ENTR01'], ['canonical-arrivalMain', 'canonical-arrivalWestHomes', 'canonical-arrivalEastHomes'],
		['arrival-meadow'], [], ['landscape', 'world-first'], ['ENTR01'], 5
	),
	'market-square': facet(
		['MARKET01', 'PLAZA01'], ['canonical-marketLoop', 'canonical-riverfront', 'canonical-shulRise'],
		['market-quarter'], [], ['character-first', 'speaker-forward'], ['MARKET01'], 5
	),
	'river-garden': facet(
		[], ['canonical-riverfront', 'canonical-eastBank'],
		['riverfront-gardens'], ['lower-river', 'lower-lake'], ['water-feature', 'world-first'],
		['BRIDGE01', 'WELL01', 'MARKET01'], 3, 7, 2
	),
	'shul-terrace': facet(
		['SHUL01'], ['canonical-shulRise', 'canonical-upperHomes'],
		['shul-terrace'], [], ['character-first', 'world-first'], ['SHUL01'], 5
	),
	'village-well': facet(
		['WELL01'], ['canonical-riverfront', 'canonical-marketLoop'],
		['riverfront-gardens', 'market-quarter'], [], ['character-first', 'world-first'], ['WELL01'], 5
	),
	'waterfall-portal': facet(
		['WATERFALL01', 'PORTAL01'], ['canonical-waterfallPortal', 'canonical-upperHomes'],
		['waterfall-portal'], ['mountain-headwater', 'upper-cascades'], ['water-feature', 'landscape'], ['PORTAL01'], 4
	)
});

export function canonicalVillageLocationFacets(locationId) {
	return FACETS_BY_LOCATION[String(locationId || '')] || EMPTY_FACET;
}

const EMPTY_FACET = facet([], [], [], [], ['world-first'], [], 5);

function facet(
	landmarks,
	paths,
	vegetationRegions,
	waterFeatures,
	preferredLayouts,
	forbiddenOccluders,
	riverClearance,
	cameraTerrain = 5,
	cameraTargetTerrain = 1.8
) {
	return Object.freeze({
		forbiddenOccluders: Object.freeze(forbiddenOccluders),
		landmarks: Object.freeze(landmarks),
		minimumClearances: Object.freeze({
			cameraTargetTerrain,
			cameraTerrain,
			river: riverClearance
		}),
		paths: Object.freeze(paths),
		preferredLayouts: Object.freeze(preferredLayouts),
		vegetationRegions: Object.freeze(vegetationRegions),
		waterFeatures: Object.freeze(waterFeatures)
	});
}
