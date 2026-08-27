// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioLegacyStorageHelpers
 * @description
 * The Awtsmoos preserves the former helper import surface without resurrecting
 * prompts, alerts, duplicate databases, or a second settings implementation.
 */

import {
	initializeDatabase,
	loadSettings,
	saveSettings
} from "./settingsStore.js";
import {
	applyPreset,
	deletePreset as deleteStoredPreset,
	refreshPresetList,
	savePreset as saveStoredPreset
} from "./presetStore.js";

export async function initDB(appState) {
	await initializeDatabase(appState);
	await refreshPresetList(appState);
}

export { loadSettings, saveSettings };

export function savePreset(appState, name) {
	return saveStoredPreset(appState, name);
}

export function deletePreset(appState, name) {
	const selectedName = name
		|| document.getElementById("preset-select")?.value
		|| "";
	return deleteStoredPreset(appState, selectedName);
}

export function applyPresetByName(appState, name) {
	return applyPreset(appState, name);
}

export { applyPreset };
