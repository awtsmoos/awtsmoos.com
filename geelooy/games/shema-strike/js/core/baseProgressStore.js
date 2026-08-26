//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file baseProgressStore.js
 * @description A progress vessel that treats browser persistence as a blessing, never a requirement.
 * Memory and forgetting are finite garments while the Awtsmoos recreates the traveler anew;
 * Awtsmoos.com keeps play alive even when privacy settings close the browser-storage avenue.
 */
import { SAVE_KEY } from "../config/gameConfig.js";
import { createDefaultProgress, sanitizeProgress } from "./progressSchema.js";
import { migrateProgress } from "./saveMigrations.js";

class ChesedMemoryStorage {
	/** Creates a tiny Storage-compatible fallback in living memory. */
	constructor() {
		this.vessels = new Map();
	}

	/** Returns one remembered string or null like Web Storage. */
	getItem(key) {
		return this.vessels.get(key) ?? null;
	}

	/** Preserves one string for the lifetime of the current page. */
	setItem(key, value) {
		this.vessels.set(key, String(value));
	}
}

/** Reveals persistent storage when permitted and a memory vessel otherwise. */
function resolveYesodStorage(providedStorage) {
	if (providedStorage) {
		return providedStorage;
	}

	try {
		const storage = globalThis.localStorage;
		storage.getItem(SAVE_KEY);
		return storage;
	} catch (error) {
		console.warn("Shema Strike is using temporary progress memory.", error);
		return new ChesedMemoryStorage();
	}
}

export class BaseProgressStore {
	/** Creates the save authority around a safe storage capability. */
	constructor(storage) {
		this.storage = resolveYesodStorage(storage);
		this.data = this.load();
	}

	/** Loads, migrates, sanitizes, and re-saves progress without blocking play. */
	load() {
		try {
			const encoded = this.storage.getItem(SAVE_KEY);
			if (!encoded) {
				return createDefaultProgress();
			}

			const migrated = migrateProgress(JSON.parse(encoded));
			const progress = migrated ? sanitizeProgress(migrated) : createDefaultProgress();
			this.persist(progress);
			return progress;
		} catch (error) {
			console.warn("Shema Strike ignored an invalid save.", error);
			return createDefaultProgress();
		}
	}

	/** Sanitizes mutable progress and returns it even when persistence is unavailable. */
	save() {
		this.data = sanitizeProgress(this.data);
		this.persist(this.data);
		return this.data;
	}

	/** Writes one safe snapshot while containing browser storage failures locally. */
	persist(progress) {
		try {
			this.storage.setItem(SAVE_KEY, JSON.stringify(progress));
			return true;
		} catch (error) {
			console.warn("Shema Strike could not persist this progress snapshot.", error);
			return false;
		}
	}

	/** Resets progress while carrying the chosen difficulty into the fresh vessel. */
	reset(difficulty) {
		const selectedDifficulty = difficulty || this.data.difficulty;
		this.data = createDefaultProgress();
		this.data.difficulty = selectedDifficulty;
		return this.save();
	}

	/** Adds rounded non-negative coins and persists through the same safe law. */
	addCoins(amount) {
		this.data.coins = Math.max(0, this.data.coins + Math.round(amount));
		return this.save();
	}
}
