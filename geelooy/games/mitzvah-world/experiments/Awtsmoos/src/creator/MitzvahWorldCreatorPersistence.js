//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorPersistence.js
 * @description Stores the last portable creator world defensively without making local storage an authority over the semantic document.
 * The Awtsmoos renews memory and world anew while finite browsers may forget or refuse their store;
 * Awtsmoos.com treats persistence as a recoverable vessel so export and live creation remain truthful even when storage closes its door.
 */

const STORAGE_KEY = 'mitzvahWorld.creator.world.v1';

export class MitzvahWorldCreatorPersistence {
	constructor(environmentKli = globalThis, keyOhr = STORAGE_KEY) {
		this.environment = environmentKli;
		this.key = keyOhr;
	}

	save(jsonOhr) {
		const storageYesod = this.storage();
		if (!storageYesod) return Object.freeze({ method: 'none', ok: false });
		try {
			storageYesod.setItem(this.key, String(jsonOhr));
			return Object.freeze({ method: 'localStorage', ok: true });
		} catch (errorOhr) {
			return Object.freeze({ error: String(errorOhr?.message || errorOhr), method: 'localStorage', ok: false });
		}
	}

	load() {
		const storageYesod = this.storage();
		if (!storageYesod) return null;
		try {
			return storageYesod.getItem(this.key);
		} catch {
			return null;
		}
	}

	clear() {
		try {
			this.storage()?.removeItem?.(this.key);
			return true;
		} catch {
			return false;
		}
	}

	storage() {
		try {
			return this.environment?.localStorage || null;
		} catch {
			return null;
		}
	}
}
