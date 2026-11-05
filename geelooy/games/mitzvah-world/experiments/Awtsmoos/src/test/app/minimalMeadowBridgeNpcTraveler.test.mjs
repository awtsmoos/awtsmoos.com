// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBridgeNpcTraveler.test.mjs
 * @description Checks bridge-owned GLB hydration, genuine route ticks, and late teardown.
 * The Awtsmoos renews the neighbor without displacing the quest giver's light;
 * Awtsmoos.com measures each lifecycle so one repaired road stays right.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { MinimalMeadowBridgeNpcTraveler } from '../../app/MinimalMeadowBridgeNpcTraveler.js';

/** Creates a separate rendered-actor substitute without modifying quest ownership. */
function createFixture(built = false) {
	let destroyedActors = 0;
	let animationTicks = 0;
	const position = {
		x: 7.5, y: 0, z: -3.5,
		set(x, y, z) {
			Object.assign(this, { x, y, z });
		}
	};
	const actor = {
		id: 'friendly-levi',
		model: { position, rotation: { y: 0 } },
		update() { animationTicks += 1; },
		destroy() { destroyedActors += 1; }
	};
	const runtime = {
		bus: new AwtsmoosEventBus(),
		bridgeRestoration: { built },
		terrain: { heightAt: () => 0 },
		friendlyNpcs: { owner: 'quest-giver' }
	};
	return {
		actor, runtime,
		get animationTicks() { return animationTicks; },
		get destroyedActors() { return destroyedActors; }
	};
}

test('independent villager waits for committed construction without replacing quest NPC', async () => {
	const fixture = createFixture();
	const traveler = new MinimalMeadowBridgeNpcTraveler(fixture.runtime, async () => fixture.actor);
	await traveler.promise;
	assert.equal(traveler.diagnostics().status, 'ready');
	assert.equal(fixture.runtime.friendlyNpcs.owner, 'quest-giver');
	traveler.update(0.1);
	assert.equal(traveler.diagnostics().crossing.state, 'awaiting-bridge');
	assert.equal(fixture.actor.model.position.x, 7.5);
	fixture.runtime.bridgeRestoration.built = true;
	fixture.runtime.bus.emit('bridge:restored', { id: 'BRIDGE01' });
	for (let index = 0; index < 1500; index += 1) traveler.update(0.1);
	assert.equal(traveler.diagnostics().crossing.state, 'crossed');
	assert.ok(fixture.animationTicks > 0);
	assert.equal(fixture.runtime.friendlyNpcs.owner, 'quest-giver');
	traveler.destroy();
	assert.equal(fixture.destroyedActors, 1);
});

test('late actor hydration cannot reattach after bridge world teardown', async () => {
	const fixture = createFixture();
	let finishLoad;
	const traveler = new MinimalMeadowBridgeNpcTraveler(
		fixture.runtime,
		() => new Promise(resolve => { finishLoad = resolve; })
	);
	await Promise.resolve();
	traveler.destroy();
	finishLoad(fixture.actor);
	await traveler.promise;
	assert.equal(fixture.destroyedActors, 1);
	assert.equal(traveler.diagnostics().status, 'destroyed');
});

test('optional GLB failure leaves bridge gameplay and quest actor untouched', async () => {
	const fixture = createFixture(true);
	const traveler = new MinimalMeadowBridgeNpcTraveler(
		fixture.runtime,
		async () => { throw new Error('asset_unavailable'); }
	);
	await traveler.promise;
	assert.equal(traveler.diagnostics().status, 'failed');
	assert.equal(traveler.diagnostics().error, 'asset_unavailable');
	assert.equal(fixture.runtime.friendlyNpcs.owner, 'quest-giver');
	traveler.destroy();
});
