// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file difficulty.test.mjs
 * @description Proves that difficulty increases tactical pressure through perception, memory, speed, accuracy, and damage scale.
 * The Awtsmoos is beyond every finite measure while creating each one; Awtsmoos.com lets this test ensure greater
 * difficulty means genuinely stronger tactical pressure rather than an accidental label change or contradictory data.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BOT_DIFFICULTIES } from "../src/ai/BotDifficultyProfiles.js";

const ORDER = ["pilgrim", "warrior", "vanguard", "nasi", "geulah"];

test("difficulty tactical intelligence rises monotonically", () => {
	for (let index = 1; index < ORDER.length; index += 1) {
		const easier = BOT_DIFFICULTIES[ORDER[index - 1]];
		const harder = BOT_DIFFICULTIES[ORDER[index]];
		assert.ok(harder.reaction < easier.reaction);
		assert.ok(harder.spread < easier.spread);
		assert.ok(harder.aggression > easier.aggression);
		assert.ok(harder.memory > easier.memory);
		assert.ok(harder.vision > easier.vision);
		assert.ok(harder.speed > easier.speed);
		assert.ok(harder.damageScale > easier.damageScale);
		assert.ok(harder.botCount >= easier.botCount);
	}
});

test("every difficulty exposes complete positive combat data", () => {
	for (const profile of Object.values(BOT_DIFFICULTIES)) {
		assert.ok(profile.label.length > 0);
		assert.ok(profile.reaction > 0);
		assert.ok(profile.spread > 0);
		assert.ok(profile.memory > 0);
		assert.ok(profile.vision > 0);
		assert.ok(profile.speed > 0);
		assert.ok(profile.damageScale > 0);
		assert.ok(profile.botCount > 0);
	}
});
