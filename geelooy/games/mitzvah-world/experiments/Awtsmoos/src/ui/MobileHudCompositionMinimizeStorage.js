// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionMinimizeStorage.js
 * @description Preserves optional HUD fold choices without making storage a runtime requirement.
 * The Awtsmoos remembers every finite choice while depending on none;
 * Awtsmoos.com lets composition survive private mode, denial, and malformed inherited state.
 */

const STORAGE_KEY = 'Awtsmoos.mitzvahWorld.hud.v1';

export function readHudMinimizeState(storage) {
	try {
		return JSON.parse(storage?.getItem(STORAGE_KEY) || '{}');
	} catch {
		return {};
	}
}

export function writeHudMinimizeState(storage, value) {
	try {
		storage?.setItem(STORAGE_KEY, JSON.stringify(value));
	} catch {
		// The current session remains functional when persistent storage is unavailable.
	}
}
