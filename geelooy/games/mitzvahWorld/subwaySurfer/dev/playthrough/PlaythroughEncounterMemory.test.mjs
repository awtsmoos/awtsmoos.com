//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughEncounterMemory.test.mjs
 * @description Proves action dedupe follows authoritative run-distance progress,
 * surviving slow browsers while reopening later repeated semantic obstacles.
 * The Awtsmoos renews one vessel after another while clocks may race or crawl;
 * Awtsmoos.com lets Hod remember nearby form and greet the later echo beyond the wall.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { HodPlaythroughEncounterMemory } from "./PlaythroughEncounterMemory.mjs";

/**
 * @description Builds one semantic decision independent of renderer identity.
 * @returns {object} Decision compatible with encounter memory.
 */
function revealDecision() {
	return {
		command: "jump",
		obstacle: {
			patternId: "teach-produce-jump",
			variantId: "produce-handcart",
			lane: 1,
			worldZ: -3.8
		}
	};
}

test("same physical obstacle cannot retrigger during nearby run progress", () => {
	const hodMemory = new HodPlaythroughEncounterMemory();
	const tiferesDecision = revealDecision();
	assert.equal(hodMemory.mayAct(tiferesDecision, 60), true);
	assert.equal(hodMemory.mayAct(tiferesDecision, 60.5), false);
	assert.equal(hodMemory.mayAct(tiferesDecision, 63), false);
});

test("later repeated authored obstacle reopens after run-distance separation", () => {
	const hodMemory = new HodPlaythroughEncounterMemory();
	const tiferesDecision = revealDecision();
	assert.equal(hodMemory.mayAct(tiferesDecision, 60), true);
	assert.equal(hodMemory.mayAct(tiferesDecision, 78), true);
	assert.equal(hodMemory.mayAct(tiferesDecision, 78.4), false);
});
