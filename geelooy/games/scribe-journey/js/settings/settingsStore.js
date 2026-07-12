// B"H

import { DEFAULT_SETTINGS, normalizeSettings, SETTINGS_KEY, SETTINGS_VERSION } from './defaultSettings.js';

function usableStorage(storage) {
	return Boolean(storage) && typeof storage.getItem === 'function' && typeof storage.setItem === 'function';
}

/** Keeps comfort preferences separate from world progress and quest truth. */
export function createSettingsStore(storage, key = SETTINGS_KEY) {
	function load() {
		if (!usableStorage(storage)) return { ...DEFAULT_SETTINGS };
		const text = storage.getItem(key);
		if (!text) return { ...DEFAULT_SETTINGS };
		try {
			const parsed = JSON.parse(text);
			if (parsed?.version !== SETTINGS_VERSION) return { ...DEFAULT_SETTINGS };
			return normalizeSettings(parsed.values);
		} catch {
			return { ...DEFAULT_SETTINGS };
		}
	}

	function save(candidate) {
		const values = normalizeSettings(candidate);
		if (usableStorage(storage)) {
			storage.setItem(key, JSON.stringify({ version: SETTINGS_VERSION, values }));
		}
		return values;
	}

	function reset() {
		if (usableStorage(storage)) storage.removeItem(key);
		return { ...DEFAULT_SETTINGS };
	}

	return { load, reset, save };
}
