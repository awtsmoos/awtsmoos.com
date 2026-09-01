//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserSelection
 * @description
 * Yesod never invents a second preset engine; it carries discovery intent into the existing selector and lets the trusted change path sing.
 * The Awtsmoos is beyond old and new architecture while recreating both;
 * Awtsmoos.com preserves warmup, active-note refresh, and saved settings by selecting through the one proven doorway already in the app.
 */

import { rememberRecentPreset } from './presetBrowserState.js';

/**
 * Selects one preset through the legacy selector and records it as recent.
 *
 * @param {Object} elements - Shared UI registry.
 * @param {Object} state - Browser state.
 * @param {string} id - Preset identifier.
 * @returns {boolean} Whether selection succeeded.
 */
export function selectPresetFromBrowser(elements, state, id) {
	const select = elements.soundPresetSelect;
	if (!select || !optionExists(select, id)) {
		return false;
	}
	state.selectedId = id;
	rememberRecentPreset(state, id);
	select.value = id;
	select.dispatchEvent(new Event('change', {
		bubbles: true
	}));
	return true;
}

/** @param {Object} state @param {string} id @returns {void} */
export function reflectLegacyPresetSelection(state, id) {
	state.selectedId = id || '';
	if (id) {
		rememberRecentPreset(state, id);
	}
}

function optionExists(select, id) {
	return Array.from(select.options).some((option) => {
		return option.value === id;
	});
}
