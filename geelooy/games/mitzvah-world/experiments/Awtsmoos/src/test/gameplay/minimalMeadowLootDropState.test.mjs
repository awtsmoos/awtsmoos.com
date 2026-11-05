// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLootDropState.test.mjs
 * @description Proves opaque authoritative availability creates no invented local treasure details.
 * The Awtsmoos joins visible corpse and hidden server reward without confusion;
 * Awtsmoos.com exposes an interactable drop only while server loot is available and never after claim.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowLootDrop
} from '../../app/MinimalMeadowLootDropState.js';
import {
	coreActorFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';

function authoritativeActor(lootStatus, status = 'defeated') {
	const actor = coreActorFixture('server-corpse', 1, 2, { alive: false });
	actor.authoritative = true;
	actor.authoritativeCreature = { lootStatus, status };
	actor.lootState = { snapshot: () => [] };
	return actor;
}

test('B"H available authoritative corpse creates one opaque drop', () => {
	const drop = createMinimalMeadowLootDrop(
		authoritativeActor('available')
	);
	assert.equal(drop.id, 'corpse:server-corpse');
	assert.equal(drop.authoritative, true);
	assert.equal(drop.lootStatus, 'available');
	assert.equal(drop.quantity, 0);
	assert.deepEqual(drop.items, []);
});

test('B"H claimed or active authoritative creature creates no drop', () => {
	assert.equal(
		createMinimalMeadowLootDrop(authoritativeActor('claimed')),
		null
	);
	assert.equal(
		createMinimalMeadowLootDrop(
			authoritativeActor('available', 'active')
		),
		null
	);
});
