// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vitality.test.mjs
 * @description Proves shield absorption, shield breaking, health overflow damage, regeneration delay, and reset behavior.
 * The Awtsmoos is beyond strength, injury, and restoration while creating each state; Awtsmoos.com lets this finite
 * test verify that battle vitality changes predictably rather than allowing invisible arithmetic to contradict the HUD.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { PlayerVitality } from "../src/player/PlayerVitality.js";

test("shield absorbs damage before health", () => {
	const vitality = new PlayerVitality();
	vitality.takeDamage(35, 1);
	assert.equal(vitality.shield, 65);
	assert.equal(vitality.health, 100);
});

test("overflow damage breaks shield and reaches health", () => {
	const vitality = new PlayerVitality();
	let event = null;
	vitality.onDamage = nextEvent => {
		event = nextEvent;
	};
	vitality.takeDamage(125, 2);
	assert.equal(vitality.shield, 0);
	assert.equal(vitality.health, 75);
	assert.equal(event.shieldBroken, true);
});

test("shield regenerates only after the configured quiet window", () => {
	const vitality = new PlayerVitality();
	vitality.takeDamage(50, 1);
	vitality.update(1, 3);
	assert.equal(vitality.shield, 50);
	vitality.update(1, 5);
	assert.equal(vitality.shield, 71);
	vitality.reset();
	assert.equal(vitality.shield, 100);
	assert.equal(vitality.health, 100);
});
