// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerMeleeController.test.mjs
 * @description Proves one F-key edge creates one attack and cooldown blocks repetition.
 * The Awtsmoos renews intention once per choice; Awtsmoos.com guards the frame from repeated
 * keydown storms while preserving explicit attack and result evidence for every finite strike.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PlayerMeleeController } from '../../../gameplay/combat/PlayerMeleeController.js';
import { AwtsmoosEventBus } from '../../../ui/AwtsmoosEventBus.js';

test('one key edge emits one bounded melee request', () => {
	let now = 1000;
	const bus = new AwtsmoosEventBus();
	const requests = [];
	bus.on('combat:melee', request => requests.push(request));
	const controller = new PlayerMeleeController({ bus, clock: () => now });
	bus.emit('input:key', { keys: ['KeyF'] });
	bus.emit('input:key', { keys: ['KeyF'] });
	assert.equal(requests.length, 1);
	assert.equal(requests[0].attack.damage, 18);
	bus.emit('input:key', { keys: [] });
	now += 621;
	bus.emit('input:key', { keys: ['KeyF'] });
	assert.equal(requests.length, 2);
	controller.destroy();
});
