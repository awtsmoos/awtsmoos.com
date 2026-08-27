// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowPlayerDefeatLifecycle.test.mjs
 * @description Proves clamping, singular defeat, complete locks, and exactly-once recovery.
 * The Awtsmoos renews the player through evidence rather than optimism; Awtsmoos.com lets
 * every assertion witness balanced damage, exact zero, explicit return, and timed return.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMinimalEnemyDamage } from '../../app/MinimalMeadowEnemyDamage.js';
import { createPlayerDefeatFixture } from './minimalMeadowPlayerDefeatFixture.mjs';

test('player defeat is authoritative, locked, and explicitly restored once', () => {
	const fixture = createPlayerDefeatFixture();
	const { clock, counters, runtime, timers } = fixture;
	const events = { defeated: 0, respawned: 0 };
	runtime.bus.on('player:defeated', () => events.defeated += 1);
	runtime.bus.on('player:respawned', () => events.respawned += 1);
	runtime.playerStats.health = 10;

	runtime.combatBalance.requestSlot('demon-1', 'melee');
	const aboveZero = applyMinimalEnemyDamage(runtime, 9, {
		enemyId: 'demon-1',
		mode: 'melee'
	});
	assert.equal(aboveZero.health, 5);
	assert.equal(runtime.playerDefeat.isDefeated(), false);

	clock.now += 1.4;
	runtime.combatBalance.requestSlot('demon-1', 'melee');
	const atZero = applyMinimalEnemyDamage(runtime, 9, {
		enemyId: 'demon-1',
		mode: 'melee'
	});
	assert.equal(atZero.health, 0);
	assert.equal(events.defeated, 1);
	assert.equal(timers.size, 1);
	assert.equal(runtime.state.lifecycle, 'defeated');
	assert.equal(runtime.state.collisionEnabled, false);
	assert.equal(runtime.state.targetingEnabled, false);
	assert.equal(counters.cancellations, 1);
	assert.equal(counters.playedClip, 'DeathCollapse');

	const belowZero = applyMinimalEnemyDamage(runtime, 999, {
		enemyId: 'demon-2',
		mode: 'ranged'
	});
	assert.equal(belowZero.accepted, false);
	assert.equal(belowZero.health, 0);
	assert.equal(events.defeated, 1);
	assert.deepEqual(runtime.input.axis(), {
		forward: 0,
		joystickForward: 0,
		joystickMagnitude: 0,
		joystickStrafe: 0,
		strafe: 0,
		turn: 0
	});
	assert.equal(runtime.input.consumeJump(), false);
	assert.equal(runtime.input.runRequested(), false);
	assert.equal(runtime.combat.activate('light-strike').reason, 'PLAYER_DEFEATED');
	assert.equal(runtime.enemies.cycleTarget(), false);

	assert.equal(runtime.playerDefeat.respawn('explicit-test'), true);
	assert.equal(runtime.playerDefeat.respawn('duplicate-test'), false);
	assert.equal(events.respawned, 1);
	assert.equal(timers.size, 0);
	assert.equal(runtime.playerStats.health, 100);
	assert.equal(runtime.state.lifecycle, 'active');
	assert.equal(runtime.state.collisionEnabled, true);
	assert.equal(runtime.state.inputLocked, false);
	assert.equal(runtime.state.targetingEnabled, true);
	assert.deepEqual(counters.modelPosition, { x: 4, y: 2, z: -3 });
	assert.equal(counters.cameraUpdates, 1);
	assert.equal(runtime.input.axis().forward, 1);
});

test('the defined delay executes one respawn and ignores duplicate timer calls', () => {
	const { clock, runtime, timers } = createPlayerDefeatFixture();
	let respawned = 0;
	runtime.bus.on('player:respawned', () => respawned += 1);
	runtime.playerStats.health = 5;
	runtime.combatBalance.requestSlot('demon-timer', 'melee');
	applyMinimalEnemyDamage(runtime, 9, {
		enemyId: 'demon-timer',
		mode: 'melee'
	});
	assert.equal(timers.size, 1);
	const timer = [...timers.values()][0];
	assert.equal(timer.delay, 3200);
	clock.now = 3.2;
	timer.callback();
	assert.equal(respawned, 1);
	assert.equal(runtime.playerStats.health, 100);
	assert.equal(runtime.state.lifecycle, 'active');
	timer.callback();
	assert.equal(respawned, 1);
});
