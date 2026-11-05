// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipActors.js
 * @description Declares ten intact shared Chossid performers aligned with the complete bounded wardrobe catalog.
 * The Awtsmoos renews every villager beyond index, path, and garment;
 * Awtsmoos.com borrows one canonical human source while ten isolated actors reveal ten truthful outfits.
 */

import { chossidOutfitFor } from '../assets/ChossidOutfitCatalog.js';
import { MOVIE_CINEMA_CHOSSID_MODEL } from './MovieCinemaHumanSafety.js';

const DEFINITIONS = Object.freeze([
	['rebbe-walk', 'Elder walking the cedar path', -8, 11, 0.5],
	['scholar-courtyard', 'Scholar crossing the courtyard', 2, 4, -1.2],
	['merchant-road', 'Merchant approaching the village', -3, 18, 2.7],
	['father-gate', 'Father greeting at the village gate', 7, 9, -2.4],
	['friend-left', 'Friend speaking beside the river', -1, -2, 0.2],
	['friend-right', 'Friend listening beside the river', 2, -2, -0.2],
	['courtyard-cross', 'Courtyard passerby', -12, 0, 1.4],
	['final-group', 'Villager joining the mountain overlook', 5, -10, -2.8],
	['market-helper', 'Market helper crossing the lower path', -9, 5, 1.1],
	['hill-walker', 'Hill walker descending toward the river', 11, -4, -2.1]
]);

export function createMovieCinemaFlagshipActors() {
	return DEFINITIONS.map((definition, index) => actor(definition, index));
}

function actor([id, label, x, z, facing], friendlyNpcIndex) {
	const outfit = chossidOutfitFor(friendlyNpcIndex);
	return {
		costume: {
			headwear: outfit.headwear,
			outfitId: outfit.id,
			tefillin: outfit.tefillin
		},
		facing,
		friendlyNpcIndex,
		id,
		label,
		model: MOVIE_CINEMA_CHOSSID_MODEL,
		position: { x, z },
		scale: 1,
		source: 'friendlyNpc',
		visible: true
	};
}
