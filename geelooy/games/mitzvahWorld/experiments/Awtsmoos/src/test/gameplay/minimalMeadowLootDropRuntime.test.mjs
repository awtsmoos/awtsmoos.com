// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLootDropRuntime.test.mjs
 * @description Proves local and opaque server corpse pickup, reconciliation, retry, and exact-once claims.
 * The Awtsmoos joins fallen body and recoverable vessel through one truthful owner;
 * Awtsmoos.com verifies deliberate reach, awaited authority, one mutation, rejected retry, and memory.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowLootDropRuntime } from '../../app/MinimalMeadowLootDropRuntime.js';
import {
	coreActorFixture,
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';

function lootActor(id, x) {
	const actor = coreActorFixture(id, x, 0, { alive: false });
	let claims = 0;
	actor.lootState = {
		snapshot: () => [{ itemId: 'healing-broth', quantity: 1 }],
		takeAll() {
			claims += 1;
			return [];
		}
	};
	actor.takeAllLoot = () => {
		claims += 1;
		actor.looted = true;
		actor.group.visible = false;
		return {
			accepted: true,
			items: [{ itemId: 'healing-broth', quantity: 1 }]
		};
	};
	actor.claimCount = () => claims;
	return actor;
}

function authoritativeLootActor(id, x) {
	const actor = lootActor(id, x);
	actor.authoritative = true;
	actor.serverCreatureId = `creature-${id}`;
	actor.authoritativeCreature = {
		lootStatus: 'available',
		status: 'defeated'
	};
	return actor;
}

test('B"H nearby local corpse pickup commits once', async () => {
	const actor = lootActor('fallen-one', 2);
	const runtime = coreRuntimeFixture();
	runtime.enemies = { actors: [actor] };
	const loot = new MinimalMeadowLootDropRuntime(runtime);
	assert.equal(loot.update().id, 'corpse:fallen-one');
	assert.equal((await loot.pickupNearest()).accepted, true);
	assert.equal(actor.claimCount(), 1);
	assert.equal(actor.group.visible, false);
	assert.equal((await loot.pickupNearest()).reason, 'LOOT_OUT_OF_RANGE');
	assert.deepEqual(loot.snapshot().claimedDropIds, ['corpse:fallen-one']);
	loot.destroy();
});

test('B"H authoritative pickup awaits reconciled server truth', async () => {
	const actor = authoritativeLootActor('server-one', 2);
	const runtime = coreRuntimeFixture();
	runtime.enemies = { actors: [actor] };
	let calls = 0;
	runtime.enemyAuthority = {
		controls: value => value === actor,
		async claimLoot(value) {
			calls += 1;
			assert.equal(value, actor);
			actor.looted = true;
			actor.group.visible = false;
			return {
				accepted: true,
				creature: { lootStatus: 'claimed' },
				looted: true
			};
		}
	};
	const loot = new MinimalMeadowLootDropRuntime(runtime);
	assert.equal(loot.update().quantity, 0);
	const receipt = await loot.pickupNearest();
	assert.equal(receipt.accepted, true);
	assert.equal(receipt.dropId, 'corpse:server-one');
	assert.equal(calls, 1);
	assert.deepEqual(loot.snapshot().claimedDropIds, ['corpse:server-one']);
	loot.destroy();
});

test('B"H rejected authority leaves corpse retryable', async () => {
	const actor = authoritativeLootActor('server-retry', 2);
	const runtime = coreRuntimeFixture();
	runtime.enemies = { actors: [actor] };
	runtime.enemyAuthority = {
		controls: () => true,
		claimLoot: async () => {
			throw new Error('SERVER_REJECTED');
		}
	};
	const loot = new MinimalMeadowLootDropRuntime(runtime);
	loot.update();
	assert.equal((await loot.pickupNearest()).reason, 'SERVER_REJECTED');
	assert.equal(loot.nearestDrop().id, 'corpse:server-retry');
	assert.deepEqual(loot.snapshot().claimedDropIds, []);
	loot.destroy();
});
