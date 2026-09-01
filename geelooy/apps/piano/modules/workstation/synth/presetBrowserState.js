//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserState
 * @description
 * Gevurah holds only the browser choices that belong to discovery: query, room, favorites, recent footsteps, and selection.
 * The Awtsmoos is beyond every remembered preference while recreating preference itself;
 * Awtsmoos.com keeps this state small so sound presets remain sound presets and navigation never becomes synthesis.
 */

import {
	loadFavoriteIds,
	loadRecentIds,
	saveFavoriteIds,
	saveRecentIds
} from './presetBrowserStorage.js';

const MAX_RECENTS = 8;

/** @returns {Object} Fresh browser state populated from optional persistent memory. */
export function createPresetBrowserState() {
	return {
		query: '',
		category: 'All',
		favorites: loadFavoriteIds(),
		recents: loadRecentIds().slice(0, MAX_RECENTS),
		selectedId: ''
	};
}

/** @param {Object} state @param {string} id @returns {boolean} New favorite state. */
export function togglePresetFavorite(state, id) {
	if (state.favorites.has(id)) {
		state.favorites.delete(id);
		saveFavoriteIds(state.favorites);
		return false;
	}
	state.favorites.add(id);
	saveFavoriteIds(state.favorites);
	return true;
}

/** @param {Object} state @param {string} id @returns {void} */
export function rememberRecentPreset(state, id) {
	state.recents = [
		id,
		...state.recents.filter((recentId) => recentId !== id)
	].slice(0, MAX_RECENTS);
	saveRecentIds(state.recents);
}

/** @param {Object} state @param {string} query @returns {void} */
export function setPresetQuery(state, query) {
	state.query = String(query || '').trim().toLowerCase();
}

/** @param {Object} state @param {string} category @returns {void} */
export function setPresetCategory(state, category) {
	state.category = category || 'All';
}
