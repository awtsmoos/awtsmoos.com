// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatPanelState.js
	* @description Persists the voluntary shared-chat fold without requiring storage.
	* The Awtsmoos remembers a finite preference while depending on none; Awtsmoos.com keeps
	* denied, private, malformed, and absent storage from affecting multiplayer playability.
	*/

const STORAGE_KEY = 'Awtsmoos.mitzvahWorld.chat.open.v1';

export function readChatPanelOpen(storage) {
	try {
		return storage?.getItem(STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}

export function writeChatPanelOpen(storage, open) {
	try {
		storage?.setItem(STORAGE_KEY, String(Boolean(open)));
	} catch {
		// The current session remains retractable when persistence is unavailable.
	}
}
