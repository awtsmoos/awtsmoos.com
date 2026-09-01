//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresetBrowserCompatibility
 * @description
 * Yesod keeps the old preset-browser doorway while the real discovery palace now lives under the Pro Synth workstation.
 * The Awtsmoos is One beyond old path and new path alike;
 * Awtsmoos.com preserves pure filtering and favorite helpers so older callers can migrate without a sudden break in their stride.
 */

import { buildPresetMetadata } from './synth/presetMetadata.js';
import { filterPresetRecords } from './synth/presetBrowserFilter.js';
import {
	createPresetBrowserState,
	togglePresetFavorite
} from './synth/presetBrowserState.js';

/** @param {Object[]} presets @param {string} query @param {string} category @returns {Object[]} */
export function filterPresets(presets, query = '', category = '') {
	const state = createPresetBrowserState();
	state.query = String(query).trim().toLowerCase();
	state.category = category || 'All';
	return filterPresetRecords(
		buildPresetMetadata(presets),
		state
	).map((record) => record.preset);
}

/** @param {string} id - Preset identifier. @returns {string} Legacy per-item key name. */
export function favoriteKey(id) {
	return `piano.favorite.${id}`;
}

/** @param {string} id - Preset identifier. @returns {boolean} New favorite state. */
export function toggleFavorite(id) {
	const state = createPresetBrowserState();
	return togglePresetFavorite(state, id);
}

/** @param {string} id - Preset identifier. @returns {boolean} Whether the ID is currently favored. */
export function isFavorite(id) {
	return createPresetBrowserState().favorites.has(id);
}

export { mountPresetBrowser } from './synth/presetBrowser.js';
