//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign progress tests guard final victory, endless unlocking, revisit choice, secrets, and preferences; Awtsmoos.com renews the traveler beyond storage.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { ProgressStore } from "../js/core/storage.js";

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) ?? null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}
}

test("gate twenty-seven persists victory and unlocks endless play", () => {
	const store = new ProgressStore(new MemoryStorage());
	store.completeStage(27);
	assert.equal(store.data.finalVictory, true);
	assert.equal(store.data.endlessUnlocked, true);
	assert.equal(store.data.currentStage, 28);
	assert.ok(store.data.completedStages.includes(27));
	assert.equal(store.selectStage(28), true);
});

test("unlocked gates remain revisitable without erasing completion", () => {
	const store = new ProgressStore(new MemoryStorage());
	for (let stage = 1; stage <= 6; stage += 1) {
		store.completeStage(stage);
	}
	assert.equal(store.selectStage(3), true);
	assert.equal(store.data.currentStage, 3);
	assert.deepEqual(store.data.completedStages, [1, 2, 3, 4, 5, 6]);
	assert.equal(store.selectStage(12), false);
});

test("secrets and accessibility preferences survive reload", () => {
	const storage = new MemoryStorage();
	const store = new ProgressStore(storage);
	assert.equal(store.discoverSecret("dune-buried-light"), true);
	assert.equal(store.discoverSecret("dune-buried-light"), false);
	store.setPreference("reducedParticles", true);
	store.setPreference("language", "he");
	const restored = new ProgressStore(storage);
	assert.deepEqual(restored.data.discoveredSecrets, ["dune-buried-light"]);
	assert.equal(restored.data.preferences.reducedParticles, true);
	assert.equal(restored.data.preferences.language, "he");
});
