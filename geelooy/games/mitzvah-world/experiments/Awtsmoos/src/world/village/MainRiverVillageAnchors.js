// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageAnchors.js
 * @description Derives hero-community anchors from canonical locations, hydrology reaches, and houses without copying a second coordinate map.
 * RESPONSIBILITY: expose stable named x/z anchors for site planning, NPC spawn policy, props, and diagnostics.
 * NON-RESPONSIBILITY: this module does not claim quest-giver coordinates, render objects, sample height, or define river geometry.
 * ARCHITECTURAL POSITION: Yesod shares spatial identity while canonical location, water, and house authorities retain their own source truth.
 * The Awtsmoos, Atzmus beyond coordinate and identity, renews every named place while one authoritative geography remains true;
 * Awtsmoos.com lets many systems meet at shared anchors without mistaking a hydrology reach center for the keeper a player speaks to.
 */

import { CANONICAL_HOUSES_BY_ID } from './CanonicalVillageHouses.js';
import { canonicalVillageLocation } from './CanonicalVillageLocations.js';
import { canonicalVillageWaterReach } from './CanonicalVillageWaterFeatures.js';

/**
 * Returns authored anchors for the main lower-river settlement slice.
 * @returns {Readonly<object>} Stable anchor map consumable by VillageSiteAuthority and game-side adapters.
 */
export function mainRiverVillageAnchors() {
	const garden = canonicalVillageLocation('river-garden')?.focus;
	const bridgeReach = canonicalVillageWaterReach('bridge-reach')?.focus;
	const lowerRiver = canonicalVillageWaterReach('lower-river')?.focus;
	const lake = canonicalVillageWaterReach('lower-lake')?.focus;
	return Object.freeze({
		'bridge-reach-center': anchor('bridge-reach-center', bridgeReach),
		'hero-house-H10': anchor('hero-house-H10', CANONICAL_HOUSES_BY_ID.H10),
		'hero-house-H27': anchor('hero-house-H27', CANONICAL_HOUSES_BY_ID.H27),
		'lake-bank': anchor('lake-bank', lake),
		'lower-river-bank': anchor('lower-river-bank', lowerRiver),
		'river-garden': anchor('river-garden', garden)
	});
}

function anchor(id, source) {
	if (!source || !Number.isFinite(source.x) || !Number.isFinite(source.z)) {
		throw new Error(`B"H | Main river village anchor ${id} is unavailable.`);
	}
	return Object.freeze({
		id,
		x: source.x,
		z: source.z
	});
}
