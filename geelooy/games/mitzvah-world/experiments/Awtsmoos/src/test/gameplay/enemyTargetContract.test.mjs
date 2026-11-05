// B"H
// Boruch Hashem
// Blessed is He

/** @file enemyTargetContract.test.mjs @description Proves visible hostile level, armor, health, and reward receipts. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { enemyTargetContract } from '../../world/enemy/EnemyTargetContract.js';

test('target contract exposes progression truth without mutating the actor', () => {
	const actor = {
		group: { visible: false }, health: 0, respawnAt: 32.5, selected: true, stagger: 4,
		profile: { armor: 12, attackRange: 3, face: '🌑', id: 'shade', level: 3, maxHealth: 110, name: 'Shade', role: 'Heavy', targetRadius: 1.5, xpReward: 90 },
		state: 'defeated', statusEffects: [], targetHint: () => ({ x: 1, y: 2, z: 3 })
	};
	const target = enemyTargetContract(actor);
	assert.equal(target.combatLevel, 3);
	assert.equal(target.armor, 12);
	assert.equal(target.xpReward, 90);
	assert.equal(target.defeatReceipt, 'shade:32.500');
	assert.equal(target.targetable, false);
});
