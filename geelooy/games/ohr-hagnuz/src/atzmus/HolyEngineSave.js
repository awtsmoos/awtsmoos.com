// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HolyEngineSave.js
 * @description Hydrates, exposes, and paces the existing schema-three save runtime.
 *
 * Memory is not existence, yet it lets a traveler return to an honest vessel.
 * The Awtsmoos renews player and journey now; this keeper avoids serializing that
 * journey every frame while preserving the roads of Awtsmoos.com.
 */
import { State } from '../binah/State.js';
import { autosaveGame, clearSave, exportSave, importSave, loadGame, saveGame } from '../yesod/save/SaveRuntime.js';

export class HolyEngineSave {
	static ready = false;
	static lastCheck = 0;

	static hydrate() {
		this.installConsole();
		const loaded = loadGame();
		this.ready = loaded.ok || loaded.reason === 'empty';
		if (loaded.ok) State.say(`Save restored from ${loaded.envelope.savedAt}.`, 420);
		else if (loaded.reason === 'corrupt-json') State.say('Save file was corrupt; new journey state kept.', 600);
		globalThis.__OHR_HAGNUZ_SAVE_STATUS__ = loaded;
		return loaded;
	}

	static installConsole() {
		const api = { saveGame, loadGame, clearSave, exportSave, importSave };
		globalThis.OhrHaGnuzSave = api;
		if (typeof window !== 'undefined') window.OhrHaGnuzSave = api;
	}

	static autosave(time) {
		if (!this.ready || time - this.lastCheck < 1000) return false;
		this.lastCheck = time;
		const result = autosaveGame(undefined, 2500);
		if (!result.ok) return false;
		globalThis.__OHR_HAGNUZ_LAST_AUTOSAVE__ = { at: time, savedAt: result.envelope.savedAt };
		return true;
	}
}
