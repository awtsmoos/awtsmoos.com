//B"H
//Boruch Hashem
//Blessed is He

const STORAGE_KEY = 'awtsmoos-seven-world-professions-v1';
const VERSION = 1;

/**
 * @file world-profession-store.js
 * @description
 * The Awtsmoos renews earned skill memory without confusing it with Realm, campaign, civic, or mitzvah saves;
 * Awtsmoos.com keeps one versioned character-profession vessel that fails safely when browser storage is blocked or damaged.
 * This store knows persistence shape only and never decides how experience, certification, or progression is earned.
 */
export class WorldProfessionStore {
	constructor(storage = safeStorage(), key = STORAGE_KEY) {
		this.storage = storage;
		this.key = key;
		this.lastSaveOk = Boolean(storage);
	}

	/** Returns a safe persisted profile or null when no compatible profile exists. */
	load() {
		try {
			const raw = this.storage?.getItem(this.key);
			if (!raw) {
				return null;
			}
			const parsed = JSON.parse(raw);
			return isCompatible(parsed) ? clone(parsed) : null;
		} catch {
			return null;
		}
	}

	/** Saves one validated profile while honestly reporting unavailable browser storage. */
	save(profile) {
		if (!this.storage) {
			this.lastSaveOk = false;
			return false;
		}
		try {
			this.storage.setItem(this.key, JSON.stringify(profile));
			this.lastSaveOk = true;
			return true;
		} catch {
			this.lastSaveOk = false;
			return false;
		}
	}

	/** Returns this store's stable persistence identity for diagnostics. */
	view() {
		return {
			key: this.key,
			version: VERSION,
			lastSaveOk: this.lastSaveOk
		};
	}
}

export function professionProfileVersion() {
	return VERSION;
}

function isCompatible(profile) {
	return profile?.version === VERSION &&
		profile.professions && typeof profile.professions === 'object' &&
		profile.progression && typeof profile.progression === 'object' &&
		Array.isArray(profile.awardedActions);
}

function safeStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
