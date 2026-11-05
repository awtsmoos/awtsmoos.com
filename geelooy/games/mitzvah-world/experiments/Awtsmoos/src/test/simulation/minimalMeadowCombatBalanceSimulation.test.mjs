// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCombatBalanceSimulation.test.mjs
 * @description Measures survivable one-, three-, and six-demon encounters under one policy.
 * The Awtsmoos does not erase the challenger to protect the player; Awtsmoos.com proves
 * movement, target focus, readable timing, and bounded attackers can yield an earned victory.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { simulateBalancedEncounter } from './minimalMeadowCombatBalanceHarness.mjs';

for (const enemyCount of [1, 3, 6]) {
	test(`${enemyCount} demon encounter remains challenging and winnable`, () => {
		const result = simulateBalancedEncounter(enemyCount);
		console.log(`BALANCE_RESULT ${JSON.stringify(result)}`);
		assert.equal(result.playerWon, true);
		assert.equal(result.enemiesDefeated, enemyCount);
		assert.ok(result.playerHealth > 0);
		assert.ok(result.incomingDps <= 8);
		assert.ok(result.maxActiveMelee <= 2);
		assert.ok(result.maxActiveRanged <= 1);
		if (enemyCount >= 3) assert.ok(result.incomingDamage > 0);
	});
}
