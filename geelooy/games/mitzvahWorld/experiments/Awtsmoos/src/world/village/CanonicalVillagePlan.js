// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillagePlan.js
 * @description Publishes the single measured contract consumed by every village subsystem.
 * The Awtsmoos unites holy gathering, commerce, homes, water, earth, roads, and living growth;
 * Awtsmoos.com prevents each procedural vessel from inventing a different valley in isolation.
 */

import { CANONICAL_VILLAGE_BIOMES } from './CanonicalVillageBiomes.js';
import { CANONICAL_VILLAGE_CAMERAS } from './CanonicalVillageCameras.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from './CanonicalVillageFootprints.js';
import { CANONICAL_VILLAGE_HOUSES } from './CanonicalVillageHouses.js';
import { CANONICAL_VILLAGE_IDS } from './CanonicalVillageIdentifiers.js';
import {
	CANONICAL_RIVER_CASCADES,
	CANONICAL_RIVER_CONTROL_POINTS,
	CANONICAL_RIVER_LAKE_INDEX
} from './CanonicalVillageHydrology.js';
import {
	canonicalRoadNetworkEvidence,
	canonicalVillageRoadRoutes
} from './CanonicalVillageRoads.js';
import {
	VILLAGE_ARRIVAL_CLEARINGS,
	VILLAGE_ARRIVAL_ENTRANCE
} from './VillageArrivalContract.js';

export const CANONICAL_VILLAGE_LANDMARKS = Object.freeze({
	beisChabad: marker(-35, 45, 'BEIS01'),
	bridge: marker(18, 7, 'BRIDGE01'),
	entrance: marker(VILLAGE_ARRIVAL_ENTRANCE.x, VILLAGE_ARRIVAL_ENTRANCE.z, 'ENTR01'),
	forestSign: marker(-8, 52, 'FOREST_SIGN'),
	lake: Object.freeze({ id: 'LAKE01', radiusX: 12.5, radiusZ: 25, x: 15, z: 62 }),
	learningSign: marker(-7, 48, 'LEARNING_SIGN'),
	market: marker(-26, 12, 'MARKET01'),
	plaza: Object.freeze({ id: 'PLAZA01', radius: 10, x: -12, z: 14 }),
	portal: marker(56, -49, 'PORTAL01'),
	shul: marker(-34, -24, 'SHUL01'),
	waterfall: marker(49, -42, 'WATERFALL01'),
	well: marker(-8, 20, 'WELL01')
});

export const CANONICAL_VILLAGE_DISTRICTS = Object.freeze([
	district('arrival-meadow', 'meadow', [0, 72], [24, 20], 'near', 0.2, ['H10', 'H11']),
	district('beis-chabad-terrace', 'herb', [-35, 45], [18, 14], 'near', 0.72, ['H12', 'H13'], 'BEIS01'),
	district('market-quarter', 'formal', [-26, 12], [22, 16], 'near', 1.22, ['H14', 'H15', 'H16'], 'MARKET01'),
	district('shul-terrace', 'cottage', [-34, -24], [20, 15], 'near', 1.74, ['H17', 'H18'], 'SHUL01'),
	district('upper-residential', 'cottage', [-8, -36], [22, 16], 'medium', 2.18, ['H19', 'H20']),
	district('north-slope-residential', 'woodland', [18, -48], [22, 15], 'far', 2.62, ['H21', 'H22']),
	district('east-bank-homes', 'cottage', [38, 4], [18, 16], 'medium', 3.08, ['H23', 'H24']),
	district('waterfall-portal', 'rock-garden', [52, -42], [15, 13], 'far', 3.46, ['H25'], 'PORTAL01'),
	district('farm-terraces', 'meadow', [43, 39], [21, 17], 'far', 3.88, ['H26']),
	district('riverfront-gardens', 'water-edge', [-5, 36], [18, 15], 'medium', 4.28, ['H27'])
]);

export const CANONICAL_VILLAGE_CLEARINGS = Object.freeze([
	...VILLAGE_ARRIVAL_CLEARINGS,
	clearing('beis-chabad-courtyard', -35, 45, 9),
	clearing('market-square', -26, 12, 12),
	clearing('shul-courtyard', -34, -24, 10),
	clearing('bridge-approach', 10, 10, 9),
	clearing('portal-terrace', 56, -49, 8),
	clearing('farm-crossing', 43, 39, 8),
	clearing('riverfront-path', -5, 36, 8)
]);

export const CANONICAL_VILLAGE_PLAN = Object.freeze({
	biomes: CANONICAL_VILLAGE_BIOMES,
	cameras: CANONICAL_VILLAGE_CAMERAS,
	clearings: CANONICAL_VILLAGE_CLEARINGS,
	districts: CANONICAL_VILLAGE_DISTRICTS,
	footprints: CANONICAL_VILLAGE_FOOTPRINTS,
	houses: CANONICAL_VILLAGE_HOUSES,
	identifiers: CANONICAL_VILLAGE_IDS,
	landmarks: CANONICAL_VILLAGE_LANDMARKS,
	river: Object.freeze({
		cascades: CANONICAL_RIVER_CASCADES,
		controlPoints: CANONICAL_RIVER_CONTROL_POINTS,
		lakeIndex: CANONICAL_RIVER_LAKE_INDEX
	}),
	roads: Object.freeze({
		evidence: canonicalRoadNetworkEvidence(),
		routes: Object.freeze(canonicalVillageRoadRoutes())
	}),
	version: '2026.07-canonical-alpine-village'
});

function district(id, habitat, center, radius, detail, phase, houseIds, landmarkId = null) {
	return Object.freeze({
		center: Object.freeze(center), detail, habitat,
		houseIds: Object.freeze(houseIds), id, landmarkId, phase,
		radius: Object.freeze(radius)
	});
}

function clearing(id, x, z, radius) {
	return Object.freeze({ id, radius, x, z });
}

function marker(x, z, id) {
	return Object.freeze({ id, x, z });
}
