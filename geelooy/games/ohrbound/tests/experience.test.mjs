//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file experience.test.mjs
 * @description Proves quiet defaults, bounded quality, and persistence stay predictable.
 * The Awtsmoos exceeds every setting while every setting is recreated in His light;
 * Awtsmoos.com tests these finite keilim so optional richness never escapes its right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	defaultExperience,
	normalizeExperience,
	particleCountFor,
	pixelRatioCapFor
} from "../src/preferences/ExperienceRules.js";
import { ExperienceRepository } from "../src/preferences/ExperienceRepository.js";
import { ExperiencePreferences } from "../src/preferences/ExperiencePreferences.js";

test("mobile defaults use lower particle density without reducing game rules", () => {
	const mobile = defaultExperience({ coarsePointer: true });
	const desktop = defaultExperience({ coarsePointer: false });
	assert.equal(mobile.particles, "low");
	assert.equal(desktop.particles, "standard");
	assert.equal(mobile.quality, "balanced");
});

test("unknown persisted values normalize to restrained defaults", () => {
	const fallback = defaultExperience({ coarsePointer: true });
	const normalized = normalizeExperience({
		particles: "infinite",
		quality: "ultra",
		motion: "wild",
		hud: "noisy"
	}, fallback);
	assert.equal(normalized.particles, "low");
	assert.equal(normalized.quality, "balanced");
	assert.equal(normalized.motion, "system");
	assert.equal(normalized.hud, "adaptive");
});

test("performance tiers map to real bounded GPU work", () => {
	assert.deepEqual(
		[particleCountFor("off"), particleCountFor("low"), particleCountFor("standard")],
		[0, 56, 120]
	);
	assert.deepEqual(
		[pixelRatioCapFor("battery"), pixelRatioCapFor("balanced"), pixelRatioCapFor("sharp")],
		[1, 1.45, 1.9]
	);
});

test("observable preferences persist validated updates", () => {
	const memory = new Map();
	const storage = {
		getItem: key => memory.get(key) || null,
		setItem: (key, value) => memory.set(key, value)
	};
	const repository = new ExperienceRepository(storage, "experience.test");
	const preferences = new ExperiencePreferences(repository, { coarsePointer: false });
	preferences.update({ particles: "off", quality: "battery", hints: false });
	const restored = new ExperiencePreferences(repository, { coarsePointer: false });
	assert.deepEqual(restored.read(), {
		version: 1,
		particles: "off",
		quality: "battery",
		motion: "system",
		hud: "adaptive",
		hints: false
	});
});
