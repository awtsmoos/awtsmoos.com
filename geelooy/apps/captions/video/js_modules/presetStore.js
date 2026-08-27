// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioPresetStore
 * @description
 * The Awtsmoos stores named local configurations inside the existing presets
 * object store and refreshes the visible selector without browser dialogs.
 */

import { DOM } from "./config.js";
import { applySettings, captureSettings } from "./settingsStore.js";

const storeName = "presets";

export function refreshPresetList(appState) {
	if (!appState.db || !DOM.presetSelect) {
		return Promise.resolve();
	}
	return new Promise(resolve => {
		const transaction = appState.db.transaction(storeName, "readonly");
		const request = transaction.objectStore(storeName).getAll();
		request.onsuccess = () => {
			const selected = DOM.presetSelect.value;
			DOM.presetSelect.replaceChildren(createPlaceholder());
			request.result
				.sort((left, right) => left.name.localeCompare(right.name))
				.forEach(preset => DOM.presetSelect.append(createOption(preset.name)));
			DOM.presetSelect.value = selected;
			resolve();
		};
		request.onerror = () => resolve();
	});
}

export function savePreset(appState, name) {
	if (!appState.db || !name) {
		return Promise.resolve(false);
	}
	return new Promise(resolve => {
		const transaction = appState.db.transaction(storeName, "readwrite");
		transaction.objectStore(storeName).put({
			name,
			settings: captureSettings()
		});
		transaction.oncomplete = async () => {
			await refreshPresetList(appState);
			DOM.presetSelect.value = name;
			resolve(true);
		};
		transaction.onerror = () => resolve(false);
	});
}

export function deletePreset(appState, name) {
	if (!appState.db || !name) {
		return Promise.resolve(false);
	}
	return new Promise(resolve => {
		const transaction = appState.db.transaction(storeName, "readwrite");
		transaction.objectStore(storeName).delete(name);
		transaction.oncomplete = async () => {
			await refreshPresetList(appState);
			resolve(true);
		};
		transaction.onerror = () => resolve(false);
	});
}

export function applyPreset(appState, name) {
	if (!appState.db || !name) {
		return Promise.resolve(false);
	}
	return new Promise(resolve => {
		const transaction = appState.db.transaction(storeName, "readonly");
		const request = transaction.objectStore(storeName).get(name);
		request.onsuccess = () => {
			if (!request.result?.settings) {
				resolve(false);
				return;
			}
			applySettings(request.result.settings);
			resolve(true);
		};
		request.onerror = () => resolve(false);
	});
}

function createPlaceholder() {
	const option = document.createElement("option");
	option.value = "";
	option.textContent = "Load preset…";
	return option;
}

function createOption(name) {
	const option = document.createElement("option");
	option.value = name;
	option.textContent = name;
	return option;
}
