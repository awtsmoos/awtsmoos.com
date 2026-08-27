// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioSettingsStore
 * @description
 * The Awtsmoos preserves local settings without allowing a blocked or unavailable
 * IndexedDB vessel to delay the caption studio, its controls, or its render worker.
 */

import { DOM } from "./config.js";

const databaseName = "EinSofEngineDB_v5.1";
const settingsStoreName = "settingsStore";
const presetStoreName = "presets";
const openTimeoutMilliseconds = 1500;

export function initializeDatabase(appState) {
	return new Promise(resolve => {
		let settled = false;
		const request = indexedDB.open(databaseName, 1);
		const timeout = window.setTimeout(() => {
			finish(null, "Caption studio storage timed out; continuing without persistence.");
		}, openTimeoutMilliseconds);
		function finish(database, warning = "") {
			if (settled) {
				database?.close();
				return;
			}
			settled = true;
			window.clearTimeout(timeout);
			appState.db = database;
			if (warning) {
				console.warn(warning);
			}
			resolve(database);
		}
		request.onupgradeneeded = event => {
			const database = event.target.result;
			if (!database.objectStoreNames.contains(settingsStoreName)) {
				database.createObjectStore(settingsStoreName, { keyPath: "id" });
			}
			if (!database.objectStoreNames.contains(presetStoreName)) {
				database.createObjectStore(presetStoreName, { keyPath: "name" });
			}
		};
		request.onsuccess = event => finish(event.target.result);
		request.onerror = event => finish(
			null,
			`Caption studio storage is unavailable: ${event.target.error?.message || "unknown error"}`
		);
		request.onblocked = () => finish(
			null,
			"Caption studio storage is blocked by another tab; continuing without persistence."
		);
	});
}

export function captureSettings() {
	const settings = {};
	DOM.controlsDiv?.querySelectorAll("input[id], select[id], textarea[id]").forEach(element => {
		if (element.type === "file") return;
		settings[element.id] = element.type === "checkbox"
			? element.checked
			: element.value;
	});
	return settings;
}

export function applySettings(settings) {
	Object.entries(settings || {}).forEach(([key, value]) => {
		const element = document.getElementById(key);
		if (!element || element.type === "file") return;
		if (element.type === "checkbox") {
			element.checked = Boolean(value);
		} else {
			element.value = value;
		}
	});
	const source = DOM.captionSource?.value || "simple";
	document.querySelectorAll("[data-caption-source]").forEach(radio => {
		radio.checked = radio.value === source;
	});
}

export function saveSettings(appState) {
	if (!appState.db) return;
	const transaction = appState.db.transaction(settingsStoreName, "readwrite");
	transaction.objectStore(settingsStoreName).put({
		id: "userSettings",
		...captureSettings()
	});
}

export function loadSettings(appState) {
	if (!appState.db) return Promise.resolve();
	return new Promise(resolve => {
		const transaction = appState.db.transaction(settingsStoreName, "readonly");
		const request = transaction.objectStore(settingsStoreName).get("userSettings");
		request.onsuccess = event => {
			applySettings(event.target.result);
			resolve();
		};
		request.onerror = () => resolve();
	});
}
