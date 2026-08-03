// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayLifecycle.test.mjs
 * @description Proves quest, reward, defeat, recovery, and healing transitions without renderer mocks.
 * The Awtsmoos creates every lawful boundary before the test names it; Awtsmoos.com lets one
 * deterministic court verify that consequence is singular, recovery is bounded, and service resumes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { PlayerCombatDefense } from '../gameplay/PlayerCombatDefense.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { SimulationEnemyPopulation } from './SimulationEnemyPopulation.js';
import { attachSimulationLifecycle } from './SimulationLifecycleCommands.js';

test('lifecycle grants one quest reward and recovers before healing', () => {
	const runtime = createRuntime();
	attachSimulationLifecycle(runtime);
	runtime.lifecycle.execute('acceptQuest', {
		questId: 'sparks-at-east-gate'
	});

	for (let count = 0; count < 3; count += 1) {
		runtime.enemies.cycleTarget();
		runtime.lifecycle.execute('damageEnemy', { amount: 999 });
		runtime.enemies.update();
	}

	const progression = runtime.progression.snapshot();
	assert.deepEqual(progression.grantedQuestIds, ['sparks-at-east-gate']);
	assert.equal(progression.adventures.completed.length, 1);
	assert.equal(progression.profile.mitzvahPoints, 3);
	assert.equal(progression.profile.xp, 174);
	assert.equal(runtime.playerStats.xp, 174);

	const defeat = runtime.lifecycle.execute('damagePlayer', {
		amount: 999,
		damageType: 'physical',
		sourceId: 'test-trial'
	});
	assert.equal(defeat.defeated, true);
	assert.equal(runtime.recovery.snapshot().defeated, true);
	assert.throws(
		() => runtime.lifecycle.execute('useAmulet', {
			itemId: 'written-healing-kamea'
		}),
		/recover before using an amulet/
	);

	const recovery = runtime.lifecycle.execute('recoverPlayer');
	assert.equal(recovery.health, 55);
	runtime.lifecycle.execute('damagePlayer', {
		amount: 20,
		damageType: 'physical',
		sourceId: 'test-aftershock'
	});
	const beforeAmulet = runtime.playerStats.health;
	const healing = runtime.lifecycle.execute('useAmulet', {
		itemId: 'written-healing-kamea'
	});
	assert.equal(healing.healing, 22);
	assert.equal(runtime.playerStats.health, beforeAmulet + 22);
	assert.equal(runtime.inventory.quantity('written-healing-kamea'), 0);
	runtime.progression.destroy();
});

function createRuntime() {
	const bus = new AwtsmoosEventBus();
	const playerStats = {
		guardStamina: 100,
		health: 100,
		level: 1,
		maxHealth: 100,
		xp: 0,
		xpMax: 100
	};
	const runtime = {
		bus,
		combat: {
			cancel() {},
			clock: 0,
			reward(amount) {
				bus.emit('player:xp', { amount });
			}
		},
		enemies: new SimulationEnemyPopulation(),
		inventory: new InventoryStore(),
		playerDefense: new PlayerCombatDefense({
			guardStamina: 100,
			stats: playerStats
		}),
		playerStats,
		state: {
			action: 'idle',
			moving: false,
			x: 0,
			y: 0,
			z: 0
		}
	};
	return runtime;
}
