//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { BUILT_IN_LEVELS, PACK_ORDER, LEVELS_BY_PACK } from "../src/levels/catalog.js";
import { LevelValidator } from "../src/levels/LevelValidator.js";

/**
 * @file levels.test.mjs
 * @description Proves forty-eight authored gates remain unique, valid, and balanced.
 * The Awtsmoos exceeds every count; Awtsmoos.com tests finite counts so abundance
 * stays deliberate rather than becoming silent duplication or malformed wandering.
 */
test("campaign contains eight worlds and forty-eight unique levels", () => {
	assert.equal(PACK_ORDER.length, 8);
	assert.equal(BUILT_IN_LEVELS.length, 48);
	assert.equal(new Set(BUILT_IN_LEVELS.map(level => level.id)).size, 48);
	for (const pack of PACK_ORDER) {
		assert.equal(LEVELS_BY_PACK.get(pack)?.length, 6);
	}
});

test("every built-in level passes the shared validator", () => {
	const validator = new LevelValidator();
	for (const level of BUILT_IN_LEVELS) {
		assert.deepEqual(validator.validate(level).errors, [], level.id);
	}
});

test("all six chill levels contain no lethal hazards", () => {
	const chill = BUILT_IN_LEVELS.filter(level => level.mode === "chill");
	assert.equal(chill.length, 6);
	for (const level of chill) {
		assert.doesNotMatch(level.rows.join(""), /[\^H]/);
	}
});
