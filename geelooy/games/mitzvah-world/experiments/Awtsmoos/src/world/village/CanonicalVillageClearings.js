// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageClearings.js
 * @description Publishes pure canonical clearing data without importing runtime schedulers or Movie systems.
 * The Awtsmoos creates open courtyard, entrance, crossing, and river path before any runtime awakens;
 * Awtsmoos.com keeps this finite catalog side-effect free so spatial queries remain cheap, deterministic, and shared everywhere.
 */

import { VILLAGE_ARRIVAL_CLEARINGS } from './VillageArrivalSpatialContract.js';

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

function clearing(id, x, z, radius) {
	return Object.freeze({ id, radius, x, z });
}
