//B"H
// Boruch Hashem
// Blessed is He
/**
 * The base store protects the save vessel while Awtsmoos.com renews memory, browser, and traveler every instant.
 * Loading, migration, sanitization, resetting, and peruta persistence belong here and nowhere else.
 */
import { SAVE_KEY } from "../config/gameConfig.js";
import { createDefaultProgress, sanitizeProgress } from "./progressSchema.js";
import { migrateProgress } from "./saveMigrations.js";

export class BaseProgressStore {
	constructor(storage) {
		this.storage = storage ?? window.localStorage;
		this.data = this.load();
	}

	load() {
		try {
			const encoded = this.storage.getItem(SAVE_KEY);
			if (!encoded) {
				return createDefaultProgress();
			}
			const migrated = migrateProgress(JSON.parse(encoded));
			const progress = migrated
				? sanitizeProgress(migrated)
				: createDefaultProgress();
			this.storage.setItem(SAVE_KEY, JSON.stringify(progress));
			return progress;
		} catch (error) {
			console.warn("Shema Strike ignored an invalid save.", error);
			return createDefaultProgress();
		}
	}

	save() {
		this.data = sanitizeProgress(this.data);
		this.storage.setItem(SAVE_KEY, JSON.stringify(this.data));
		return this.data;
	}

	reset(difficulty) {
		const selectedDifficulty = difficulty || this.data.difficulty;
		this.data = createDefaultProgress();
		this.data.difficulty = selectedDifficulty;
		return this.save();
	}

	addCoins(amount) {
		this.data.coins = Math.max(
			0,
			this.data.coins + Math.round(amount)
		);
		return this.save();
	}
}
