// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localExpansionProgression.test.mjs
 * @description Proves solo upgrades, repeatable bounty baselines, mastery, and authority isolation.
 * The Awtsmoos makes solitary service answer the same durable design; Awtsmoos.com witnesses
 * exact material use, duplicate refusal, proof advancement, and real combat-driven learning.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalCombatMasteryBridge } from '../../gameplay/expansion/LocalCombatMasteryBridge.js';
import { LocalExpansionAuthority } from '../../gameplay/expansion/LocalExpansionAuthority.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('solo upgrades consume materials once and expose one passive source', () => {
	const authority = new LocalExpansionAuthority(() => 1000);
	authority.state.materials['cedar-wood'] = 3;
	authority.state.materials['staff-splinter'] = 2;
	const first = authority.upgradeEquipment('staff-oak-binding');
	assert.equal(first.duplicate, false);
	assert.equal(authority.state.materials['cedar-wood'], 0);
	assert.equal(authority.state.passiveSources.length, 1);
	const duplicate = authority.upgradeEquipment('staff-oak-binding');
	assert.equal(duplicate.duplicate, true);
	assert.equal(authority.state.passiveSources.length, 1);
});

test('repeatable solo bounties advance their proof baseline', () => {
	let now = 1000;
	const authority = new LocalExpansionAuthority(() => now);
	authority.state.activities['herb-gathering'] = { count: 3 };
	const first = authority.claimBounty('kedem-herbal-request');
	assert.equal(first.claims, 1);
	authority.state.activities['herb-gathering'].count = 6;
	now = 2000;
	const second = authority.claimBounty('kedem-herbal-request');
	assert.equal(second.claims, 2);
	assert.equal(authority.state.materials['letter-fragment'], 2);
});

test('local combat events grant mastery and shared authority suppresses local gain', () => {
	const authority = new LocalExpansionAuthority();
	const runtime = { bus: new AwtsmoosEventBus(), enemyAuthority: null };
	const bridge = new LocalCombatMasteryBridge(runtime, authority);
	runtime.bus.emit('combat:melee-result', { actionId: 'staff-light-one' });
	runtime.bus.emit('combat:melee-result', { actionId: 'sword-light-one' });
	runtime.bus.emit('combat:parry', {});
	runtime.bus.emit('combat:cast-result', {});
	assert.deepEqual(authority.state.mastery, {
		defense: 2,
		staff: 1,
		sword: 1,
		torah: 1
	});
	runtime.enemyAuthority = {};
	runtime.bus.emit('combat:parry', {});
	assert.equal(authority.state.mastery.defense, 2);
	bridge.destroy();
});
