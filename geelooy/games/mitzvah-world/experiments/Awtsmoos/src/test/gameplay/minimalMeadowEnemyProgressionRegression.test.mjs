// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyProgressionRegression.test.mjs
 * @description Proves XP leveling and distinct defeated-enemy credit survive combat balancing.
 * The Awtsmoos gives each demon one unconfused identity and each victory its honest reward;
 * Awtsmoos.com preserves quest-facing defeat events, corpse truth, and player progression.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { rewardMinimalCombatPlayer } from '../../app/MinimalMeadowCombatSupport.js';
import { damageMinimalEnemy } from '../../app/MinimalMeadowEnemyLifecycle.js';
import { minimalEnemyPayload } from '../../app/MinimalMeadowEnemyState.js';

test('XP, quest defeat events, and distinct enemy credit remain intact', () => {
	const progressionEvents = [];
	const runtime = {
		bus: {
			emit(type, payload) {
				progressionEvents.push({ payload, type });
			}
		},
		playerStats: {
			level: 1,
			xp: 90,
			xpMax: 100
		}
	};
	const reward = rewardMinimalCombatPlayer(runtime, 25);
	assert.equal(reward.amount, 25);
	assert.equal(runtime.playerStats.level, 2);
	assert.equal(runtime.playerStats.xp, 15);
	assert.equal(runtime.playerStats.xpMax, 135);
	assert.equal(progressionEvents[0].type, 'player:xp');

	const first = createEnemy('demon-credit-one', 18);
	const second = createEnemy('demon-credit-two', 27);
	const firstResult = damageMinimalEnemy(first, 999);
	const secondResult = damageMinimalEnemy(second, 999);
	assert.equal(firstResult.defeated, true);
	assert.equal(secondResult.defeated, true);
	assert.notEqual(firstResult.id, secondResult.id);
	assert.equal(firstResult.xpReward, 18);
	assert.equal(secondResult.xpReward, 27);
	assert.equal(first.events[0].type, 'enemy:defeated');
	assert.equal(second.events[0].type, 'enemy:defeated');
	assert.equal(first.events[0].payload.id, 'demon-credit-one');
	assert.equal(second.events[0].payload.id, 'demon-credit-two');
	assert.equal(first.events[0].payload.corpse, true);
	assert.equal(first.events[0].payload.lootable, true);
});

function createEnemy(id, xpReward) {
	const events = [];
	const actor = {
		action: 'idle',
		alive: true,
		bus: {
			emit(type, payload) {
				events.push({ payload, type });
			}
		},
		deathTime: 0,
		events,
		health: 30,
		hitTime: 0,
		looted: false,
		moving: false,
		profile: {
			armor: 1,
			id,
			level: 2,
			maxHealth: 30,
			name: 'Shadow Chai',
			temperament: 'melee',
			xpReward
		},
		selected: false
	};
	actor.payload = () => minimalEnemyPayload(actor);
	return actor;
}
