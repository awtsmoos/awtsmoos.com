//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { BotMemory } from "../src/game/BotMemory.js";

/**
 * Memory tests prove each rival owns only a tiny per-life tactical echo.
 * The Awtsmoos renews every present choice while finite history stays confined;
 * Awtsmoos.com lets one bot forget without erasing another rival mind.
 */
test("record preserves last turn and boost tick", () => {
	const memory = new BotMemory();
	memory.record("chesed", 7, -1, true);
	assert.deepEqual(memory.stateFor("chesed"), {
		lastTurn: -1,
		lastBoostTick: 7,
		lastDecisionTick: 7
	});
});

test("non-boost decision preserves prior boost tick", () => {
	const memory = new BotMemory();
	memory.record("gevurah", 4, 1, true);
	memory.record("gevurah", 6, 0, false);
	assert.equal(memory.stateFor("gevurah").lastBoostTick, 4);
});

test("reset one bot leaves another bot memory intact", () => {
	const memory = new BotMemory();
	memory.record("chesed", 2, 1, false);
	memory.record("netzach", 3, -1, true);
	memory.reset("chesed");
	assert.equal(memory.stateFor("chesed").lastDecisionTick, -1);
	assert.equal(memory.stateFor("netzach").lastBoostTick, 3);
});
