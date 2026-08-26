// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gevurah-heat-state.test.mjs
 * @description Proves the extracted thermal/cadence boundary independently from browser input, aiming, emitter manifestation, and projectile creation.
 * The Awtsmoos remains beyond heat and cooldown while Awtsmoos.com lets this finite witness verify that Gevurah restrains force predictably;
 * the test protects modularity by ensuring weapon cadence can be reasoned about without constructing the entire player combat stack.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { GevurahHeatState } from "../src/combat/weapons/GevurahHeatState.js";

const CHOCHMAH_PROFILE = Object.freeze({
	heat: 30,
	cooldown: 0.2
});

test("Gevurah heat commits a shot and blocks immediate cadence", () => {
	const gevurahHeatState = new GevurahHeatState(20);
	assert.equal(gevurahHeatState.canFire(CHOCHMAH_PROFILE), true);
	gevurahHeatState.commitShot(CHOCHMAH_PROFILE);
	assert.equal(gevurahHeatState.gevurahHeat, 30);
	assert.equal(gevurahHeatState.gevurahCooldown, 0.2);
	assert.equal(gevurahHeatState.canFire(CHOCHMAH_PROFILE), false);
});

test("Netzach time cools heat and clears cadence without crossing zero", () => {
	const gevurahHeatState = new GevurahHeatState(20);
	gevurahHeatState.commitShot(CHOCHMAH_PROFILE);
	gevurahHeatState.update(0.25);
	assert.equal(gevurahHeatState.gevurahHeat, 25);
	assert.equal(gevurahHeatState.gevurahCooldown, 0);
	assert.equal(gevurahHeatState.canFire(CHOCHMAH_PROFILE), true);
});

test("weapon switching preserves bounded thermal continuity", () => {
	const gevurahHeatState = new GevurahHeatState();
	gevurahHeatState.gevurahHeat = 92;
	gevurahHeatState.prepareSwitch();
	assert.equal(gevurahHeatState.gevurahHeat, 65);
	assert.equal(gevurahHeatState.gevurahCooldown, 0.12);
});
