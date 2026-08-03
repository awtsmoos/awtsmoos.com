// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipActors.js
 * @description Declares eight intact shared Chossid performers with safe root transforms and distinct wardrobe intent.
 * The Awtsmoos renews every person beyond index, role, and garment; Awtsmoos.com borrows
 * the canonical loaded Chossid vessels without changing bones, proportions, skin weights, or human form.
 */

import { MOVIE_CINEMA_CHOSSID_MODEL } from './MovieCinemaHumanSafety.js';

export function createMovieCinemaFlagshipActors() {
	return [
		actor('rebbe-walk', 0, 'Elder walking the cedar path', -8, 11, 0.5, '#20252e'),
		actor('scholar-courtyard', 1, 'Scholar crossing the courtyard', 2, 4, -1.2, '#334c68'),
		actor('merchant-road', 2, 'Merchant approaching village', -3, 18, 2.7, '#5a4634'),
		actor('father-gate', 3, 'Father at village gate', 7, 9, -2.4, '#394f3a'),
		actor('friend-left', 4, 'Friend in conversation', -1, -2, 0.2, '#553d62'),
		actor('friend-right', 5, 'Friend answering', 2, -2, -0.2, '#6a4b35'),
		actor('courtyard-cross', 6, 'Courtyard passerby', -12, 0, 1.4, '#324c55'),
		actor('final-group', 7, 'Final mountain overlook', 5, -10, -2.8, '#433f58')
	];
}

function actor(id, friendlyNpcIndex, label, x, z, facing, garment) {
	return {
		costume: {
			accent: '#d3b17a',
			garment,
			hat: true
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
