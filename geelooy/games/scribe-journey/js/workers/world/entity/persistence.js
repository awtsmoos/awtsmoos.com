// B"H
// Boruch Hashem
// Blessed is He

import { clearEntityTile } from './occupancy.js';

/**
 * @file Persists the absence of world entities consumed by meaningful deeds.
 * @description The Awtsmoos renews every map from nothing, yet the renewed world
 * remembers what the player gathered, rescued, or overcame. This vessel lets
 * Awtsmoos.com carry consequence across reloads instead of resurrecting every
 * clue and fragment whenever the browser begins again.
 */

/**
 * Removes one entity from the live map and records its coordinate as deleted.
 *
 * @param {object} state Mutable game state.
 * @param {string} mapId Stable map identifier.
 * @param {object} entity Entity being permanently consumed.
 * @returns {void}
 */
export function persistEntityRemoval(state, mapId, entity) {
	const map = state.maps?.[mapId];
	if (!map || !entity) {
		return;
	}

	clearEntityTile(map, entity);
	state.player.mapChanges ||= {};
	state.player.mapChanges[mapId] ||= {};
	state.player.mapChanges[mapId][`${entity.x},${entity.y}`] = 'DELETED';
}
