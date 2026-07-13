//B"H
// Boruch Hashem
// Blessed is He
/**
 * Save tests guard remembered journeys, secrets, preferences, and completion while Awtsmoos.com renews the player beyond storage.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { SAVE_KEY } from "../js/config/gameConfig.js";
import { sanitizeProgress } from "../js/core/progressSchema.js";
import { migrateProgress } from "../js/core/saveMigrations.js";
import { ProgressStore } from "../js/core/storage.js";

class MemoryStorage {
	constructor(entries = {}) {
		this.values = new Map(Object.entries(entries));
	}

	getItem(key) {
		return this.values.get(key) ?? null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}
}

test("v3 progress migrates through v4 into v5 without losing choices", () => {
	const migrated = migrateProgress({
		version: 3,
		coins: 47,
		equippedWeapon: "ember-spear",
		ownedWeapons: ["or-blade", "ember-spear"]
	});
	assert.equal(migrated.version, 5);
	assert.equal(migrated.coins, 47);
	assert.deepEqual(migrated.completedStages, []);
	assert.deepEqual(migrated.discoveredSecrets, []);
});

test("v4 progress receives campaign completion and preference fields", () => {
	const migrated = migrateProgress({ version: 4, coins: 22, checkpoint: null });
	assert.equal(migrated.version, 5);
	assert.equal(migrated.finalVictory, false);
	assert.equal(migrated.endlessUnlocked, false);
	assert.deepEqual(migrated.preferences, {});
});

test("sanitization repairs catalogs and constrains preferences", () => {
	const progress = sanitizeProgress({
		coins: -900,
		difficulty: "impossible",
		ownedWeapons: ["unknown"],
		equippedWeapon: "unknown",
		weaponLevels: { "or-blade": 99 },
		completedStages: [1, "2", 90, 2],
		discoveredSecrets: ["thread", "thread"],
		preferences: { language: "he", textScale: 9, reducedMotion: true }
	});
	assert.equal(progress.coins, 0);
	assert.equal(progress.difficulty, "normal");
	assert.deepEqual(progress.ownedWeapons, ["or-blade"]);
	assert.equal(progress.weaponLevels["or-blade"], 5);
	assert.deepEqual(progress.completedStages, [1, 2]);
	assert.deepEqual(progress.discoveredSecrets, ["thread"]);
	assert.equal(progress.preferences.language, "he");
	assert.equal(progress.preferences.textScale, 2);
	assert.equal(progress.preferences.reducedMotion, true);
});

test("ProgressStore rewrites a v3 record as safe v5 data", () => {
	const storage = new MemoryStorage({
		[SAVE_KEY]: JSON.stringify({ version: 3, coins: 19, difficulty: "hard" })
	});
	const store = new ProgressStore(storage);
	assert.equal(store.data.version, 5);
	assert.equal(store.data.coins, 19);
	assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).version, 5);
});

test("malformed and future saves fall back safely", () => {
	const originalWarning = console.warn;
	console.warn = () => {};
	try {
		const store = new ProgressStore(new MemoryStorage({ [SAVE_KEY]: "{broken" }));
		assert.equal(store.data.version, 5);
		assert.equal(store.data.currentStage, 1);
	} finally {
		console.warn = originalWarning;
	}
	assert.equal(migrateProgress({ version: 999, coins: 500 }), null);
});
