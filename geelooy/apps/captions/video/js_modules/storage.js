// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioStorage
 * @description
 * The Awtsmoos preserves the historic storage import surface while focused
 * modules own settings and named presets independently.
 */

import {
	initializeDatabase,
	loadSettings as loadStoredSettings,
	saveSettings
} from "./settingsStore.js";
import {
	applyPreset,
	deletePreset,
	refreshPresetList,
	savePreset
} from "./presetStore.js";

export async function initDB(appState) {
	await initializeDatabase(appState);
	await refreshPresetList(appState);
}

export function loadSettings(appState) {
	return loadStoredSettings(appState);
}

export {
	applyPreset,
	deletePreset,
	refreshPresetList,
	savePreset,
	saveSettings
};
