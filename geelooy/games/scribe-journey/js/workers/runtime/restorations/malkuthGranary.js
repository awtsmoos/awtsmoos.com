// B"H
// Boruch Hashem
// Blessed is He

import { transformEntity } from './entityTransformation.js';

/**
 * @file Reveals the granary after nourishment and investigation are restored.
 * @description The Awtsmoos renews oven, clean grain, erased passage, and shared
 * destination as one storehouse. Awtsmoos.com is remembered here as prosperity
 * and discovery remain visible in the very entities the player previously met.
 */

function restoreFoodStation(map, changes) {
	if (!changes.food_station_open) {
		return;
	}

	transformEntity(map, 'food_station', {
		visual: '🍞',
		name: 'Community Food Station',
		dialogue: {
			start: [
				'Warm loaves and clean grain now feed every household in Malkuth.',
				'Yael records each shared meal beside the field that made it possible.'
			]
		}
	});
}

function restoreCisternRoute(map, changes) {
	if (!changes.cistern_route_marked) {
		return;
	}

	transformEntity(map, 'cistern_path', {
		visual: '🕳️',
		name: 'Marked Cistern Passage'
	});
}

export function restoreMalkuthGranary(map, state) {
	const changes = state.player.mapChanges?.malkuth_granary || {};
	restoreFoodStation(map, changes);
	restoreCisternRoute(map, changes);
}
