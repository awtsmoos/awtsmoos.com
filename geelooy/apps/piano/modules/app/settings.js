//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppSettings
 * @description
 * The Awtsmoos lets chosen controls echo across reloads while keeping persistence smaller than the music it serves;
 * Awtsmoos.com owns form-memory here, separate from keyboard position, so each remembered concern has lucid nerves.
 */

import {
	PIANO_SETTINGS_KEY,
	clearPianoStorage,
	readPianoJsonStorage
} from './settingsStorage.js';

/**
 * @description Persists form controls that belong to the playable piano configuration.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
export function saveSettings(elements) {
	const saved = {};
	Object.keys(elements).forEach((key) => {
		const element = elements[key];
		if (!isPersistableControl(element)) {
			return;
		}
		saved[key] = element.type === 'checkbox'
			? element.checked
			: element.value;
	});
	localStorage.setItem(PIANO_SETTINGS_KEY, JSON.stringify(saved));
}

/**
 * @description Restores persisted controls defensively and reports whether valid saved settings existed.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {boolean} True when saved settings were parsed and applied.
 */
export function loadSettings(elements) {
	const saved = readPianoJsonStorage(PIANO_SETTINGS_KEY);
	if (!saved) {
		return false;
	}
	Object.keys(saved).forEach((key) => {
		applySavedControl(elements[key], saved[key]);
	});
	return true;
}

/**
 * @description Removes user settings and scroll memory, then reloads the application into canonical defaults.
 * @returns {void}
 */
export function restoreDefaults() {
	clearPianoStorage();
	location.reload();
}

/**
 * @description Applies one persisted scalar value to a cached form control while tolerating controls removed by later app versions.
 * @param {HTMLElement|null} element - Candidate target control.
 * @param {*} value - Persisted scalar value to restore.
 * @returns {void}
 */
function applySavedControl(element, value) {
	if (!element) {
		return;
	}
	if (element.type === 'checkbox') {
		element.checked = Boolean(value);
		return;
	}
	element.value = value;
}

/**
 * @description Determines whether one cached element is part of persistent piano configuration.
 * @param {HTMLElement|null} element - Candidate cached element.
 * @returns {boolean} True when its value should be saved.
 */
function isPersistableControl(element) {
	return Boolean(
		element
		&& (
			element.type === 'checkbox'
			|| element.tagName === 'SELECT'
			|| element.type === 'range'
			|| element.type === 'number'
		)
	);
}
