// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerMeleeController.test.mjs
 * @description Proves one physical action remains bounded while canonical stats deepen its force.
 * The Awtsmoos renews intention once per choice; equipment and level may strengthen the ray,
 * while Awtsmoos.com guards against key storms, duplicate hits, and hidden work each day.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PlayerMeleeController } from '../../../gameplay/combat/PlayerMeleeController.js';
import { AwtsmoosEventBus } from '../../../ui/AwtsmoosEventBus.js';

test('one key edge emits one bounded fallback melee request', () => {
	let now = 1000;
	const bus = new AwtsmoosEventBus();
	const requests = [];
	bus.on('combat:melee', request => requests.push(request));
	const controller = new PlayerMeleeController({ bus, clock: () => now });
	bus.emit('input:key', { keys: ['KeyF'] });
	bus.emit('input:key', { keys: ['KeyF'] });
	assert.equal(requests.length, 1);
	assert.equal(requests[0].attack.damage, 18);
	assert.equal(requests[0].attack.cooldownMilliseconds, 620);
	assert.equal(controller.readiness(now).ok, false);
	bus.emit('input:key', { keys: [] });
	now += 621;
	bus.emit('input:key', { keys: ['KeyF'] });
	assert.equal(requests.length, 2);
	controller.destroy();
});

test('level, Gevurah, equipment, and recovery resolve once per strike', () => {
	let now = 2000;
	const bus = new AwtsmoosEventBus();
	const controller = new PlayerMeleeController({
		bus,
		clock: () => now,
		inventory: {
			snapshot: () => ({ stats: { damage: 12, defense: 9, focus: 0 } })
		},
		profile: {
			snapshot: () => ({
				derived: { cooldownMultiplier: 0.8, damageBonus: 6 },
				level: 5
			})
		}
	});
	const first = controller.attackNow({ source: 'test', slotIndex: 12 });
	assert.equal(first.ok, true);
	assert.equal(first.attack.damage, 36);
	assert.equal(first.attack.cooldownMilliseconds, 496);
	assert.equal(first.slotIndex, 12);
	assert.equal(controller.readiness(now + 200).cooldownRemainingMilliseconds, 296);
	now += 496;
	assert.equal(controller.readiness(now).ok, true);
	controller.destroy();
});

test('a rejected strike publishes the remaining cooldown without world polling', () => {
	let now = 3000;
	const bus = new AwtsmoosEventBus();
	const results = [];
	bus.on('combat:melee-result', result => results.push(result));
	const controller = new PlayerMeleeController({ bus, clock: () => now });
	controller.attackNow();
	now += 120;
	const rejected = controller.attackNow();
	assert.equal(rejected.ok, false);
	assert.equal(rejected.reason, 'ATTACK_COOLDOWN');
	assert.equal(rejected.cooldownRemainingMilliseconds, 500);
	assert.equal(results.at(-1).attackId, 'shliach-staff-strike');
	controller.destroy();
});
