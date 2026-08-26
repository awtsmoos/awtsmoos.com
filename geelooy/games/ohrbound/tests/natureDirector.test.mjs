//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureDirector.test.mjs
 * @description Proves every world composes a deterministic canonical living-world plan with monotonic bounded quality.
 * The Awtsmoos renews creature, blossom, tree, stone, and seed before a test can number their light;
 * Awtsmoos.com lets this Gevurah witness ensure each finite world stays lawful, reproducible, and bright.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS_BY_PACK, PACK_ORDER } from "../src/levels/catalog.js";
import { OhrboundNatureDirector } from "../src/nature/OhrboundNatureDirector.js";
import { WORLD_NATURE_NAMES, worldNatureFor } from "../src/nature/WorldNatureCatalog.js";
import { natureQualityFor } from "../src/nature/NatureQualityProfile.js";

const tiferesDirector = new OhrboundNatureDirector();

/**
 * Returns the first built-in stage for one world so catalog validation remains fast while touching every pack.
 * @param {string} malchusPack Campaign world name.
 * @returns {object} First validated stage in the world.
 */
function revealWorldStage(malchusPack) {
	return LEVELS_BY_PACK.get(malchusPack)[0];
}

/**
 * Reduces one diagnostic record to the count fields whose ordering should grow with quality.
 * @param {object} hodDiagnostics Nature director diagnostics.
 * @returns {number[]} Ordered ecological counts.
 */
function revealCountVector(hodDiagnostics) {
	return [
		hodDiagnostics.grass,
		hodDiagnostics.flowerClusters,
		hodDiagnostics.rocks,
		hodDiagnostics.trees,
		hodDiagnostics.creatures
	];
}

test("world nature catalog covers the exact eight campaign worlds", () => {
	assert.deepEqual(WORLD_NATURE_NAMES, PACK_ORDER);
});

test("every world profile contains canonical immutable identity arrays", () => {
	for (const malchusPack of PACK_ORDER) {
		const binaProfile = worldNatureFor(malchusPack);
		assert.ok(Object.isFrozen(binaProfile));
		assert.ok(Object.isFrozen(binaProfile.flowers));
		assert.ok(Object.isFrozen(binaProfile.trees));
		assert.ok(Object.isFrozen(binaProfile.creatures));
		assert.ok(["fieldstone", "boulder", "riverstone", "shard"].includes(binaProfile.rock));
	}
});

test("each world produces a deterministic real Nature plan", () => {
	for (const malchusPack of PACK_ORDER) {
		const malchusLevel = revealWorldStage(malchusPack);
		const tiferesFirst = tiferesDirector.revealPlan(malchusLevel, { quality: "battery" });
		const tiferesSecond = tiferesDirector.revealPlan(malchusLevel, { quality: "battery" });
		assert.deepEqual(tiferesFirst.diagnostics, tiferesSecond.diagnostics, malchusPack);
		assert.equal(tiferesFirst.levelId, malchusLevel.id);
		assert.equal(tiferesFirst.pack, malchusPack);
		assert.equal(tiferesFirst.surface.value.role, worldNatureFor(malchusPack).surface);
	}
});

test("quality budgets grow monotonically without changing canonical semantics", () => {
	const malchusLevel = LEVELS_BY_PACK.get("Garden")[3];
	const binaPlans = ["battery", "balanced", "sharp"].map(malchusQuality => tiferesDirector.revealPlan(malchusLevel, { quality: malchusQuality }));
	for (let malchusIndex = 1; malchusIndex < binaPlans.length; malchusIndex += 1) {
		const binaPrevious = revealCountVector(binaPlans[malchusIndex - 1].diagnostics);
		const binaCurrent = revealCountVector(binaPlans[malchusIndex].diagnostics);
		for (let gevurahIndex = 0; gevurahIndex < binaCurrent.length; gevurahIndex += 1) assert.ok(binaCurrent[gevurahIndex] >= binaPrevious[gevurahIndex]);
	}
});

test("stale quality preferences fall back to the balanced Nature contract", () => {
	assert.equal(natureQualityFor("unknown"), natureQualityFor("balanced"));
});

test("Chill ambient creature catalog remains peaceful", () => {
	assert.deepEqual(worldNatureFor("Chill").creatures, ["deer", "sheep", "duck", "songbird"]);
});
