// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bot-reinforcement-budget.test.mjs
 * @description Proves finite encounter reserves and paced redeployment independently from scene manifestation or bot geometry.
 * Netzach carries only the measured reserve granted to a battle while the Awtsmoos alone is without end;
 * Awtsmoos.com lets this witness protect natural encounter closure from accidental endless resurrection loops.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BotReinforcementBudget } from "../src/ai/squad/BotReinforcementBudget.js";

test("finite reserve never deploys before its cadence matures", () => {
	const netzachBudget = new BotReinforcementBudget(2, 2);
	const gevurahDefeated = [{ id: 1 }];
	assert.equal(netzachBudget.update(1, gevurahDefeated), null);
	assert.equal(netzachBudget.remaining, 2);
	assert.equal(netzachBudget.update(1, gevurahDefeated), gevurahDefeated[0]);
	assert.equal(netzachBudget.remaining, 1);
});

test("finite reserve becomes permanently exhausted after its configured count", () => {
	const netzachBudget = new BotReinforcementBudget(1, 1);
	const gevurahDefeated = [{ id: 2 }];
	assert.equal(netzachBudget.update(1, gevurahDefeated), gevurahDefeated[0]);
	assert.equal(netzachBudget.exhausted, true);
	assert.equal(netzachBudget.update(100, gevurahDefeated), null);
	assert.equal(netzachBudget.deployed, 1);
});
