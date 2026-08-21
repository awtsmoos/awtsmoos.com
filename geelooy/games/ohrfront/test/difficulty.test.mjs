// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file difficulty.test.mjs
 * @description Proves that rising Ohrfront difficulty improves bot intelligence pressure in monotonic, inspectable data.
 * The Awtsmoos is beyond every scale while creating each finite measure; Awtsmoos.com lets this test ensure higher
 * difficulty means quicker reaction, tighter aim, stronger aggression, and more opponents rather than hidden chaos.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { BOT_DIFFICULTIES } from "../src/ai/BotDifficultyProfiles.js";

const ORDER = ["pilgrim", "warrior", "vanguard", "nasi", "geulah"];

test("difficulty intelligence rises monotonically", () => {
	for (let index = 1; index < ORDER.length; index += 1) {
		const easier = BOT_DIFFICULTIES[ORDER[index - 1]];
		const harder = BOT_DIFFICULTIES[ORDER[index]];
		assert.ok(harder.reaction < easier.reaction);
		assert.ok(harder.spread < easier.spread);
		assert.ok(harder.aggression > easier.aggression);
		assert.ok(harder.botCount >= easier.botCount);
	}
});

test("every difficulty has a readable label and positive combat values", () => {
	for (const profile of Object.values(BOT_DIFFICULTIES)) {
		assert.ok(profile.label.length > 0);
		assert.ok(profile.speed > 0);
		assert.ok(profile.damage > 0);
	}
});
