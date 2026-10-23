// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBridgeNpcCrossing.test.mjs
 * @description Proves an actual rendered actor follows the restored graph, not a cosmetic shortcut.
 * The Awtsmoos renews the bridge beneath real measured feet;
 * Awtsmoos.com refuses a phantom crossing or a duplicate welcome to repeat.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { MinimalMeadowBridgeNpcCrossing } from '../../app/MinimalMeadowBridgeNpcCrossing.js';

/** Construct a small real-state vessel with a mutable GLB-position stand-in. */
function makeCrossingVessel(built = false) {
	const bus = new AwtsmoosEventBus();
	const position = {
		x: 7.5,
		y: 0,
		z: -3.5,
		set(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	};
	const actor = { id: 'friendly-levi', model: { position, rotation: { y: 0 } } };
	const runtime = {
		bridgeRestoration: { built },
		bus,
		terrain: { heightAt: () => 0 }
	};
	return { actor, runtime };
}

test('bridge event does not move the NPC until construction was committed', () => {
	const { actor, runtime } = makeCrossingVessel();
	const crossing = new MinimalMeadowBridgeNpcCrossing(runtime, [actor]);
	crossing.update(0.1);
	runtime.bus.emit('bridge:restored', { id: 'BRIDGE01' });
	crossing.update(0.1);
	assert.equal(actor.model.position.x, 7.5);
	assert.equal(crossing.diagnostics().state, 'awaiting-bridge');
	runtime.bridgeRestoration.built = true;
	runtime.bus.emit('bridge:restored', { id: 'BRIDGE01' });
	assert.equal(crossing.diagnostics().state, 'walking');
	assert.ok(crossing.diagnostics().totalLength > 0);
	crossing.destroy();
});

test('restored bridge causes one continuous graph crossing and one observed event', () => {
	const { actor, runtime } = makeCrossingVessel(true);
	const crossing = new MinimalMeadowBridgeNpcCrossing(runtime, [actor]);
	assert.equal(crossing.diagnostics().state, 'walking');
	let crossingEvents = 0;
	runtime.bus.on('bridge:npc-crossed', detail => {
		assert.equal(detail.actorId, 'friendly-levi');
		crossingEvents += 1;
	});
	let previousX = actor.model.position.x;
	for (let step = 0; step < 1800; step += 1) {
		crossing.update(0.1);
		assert.ok(Math.abs(actor.model.position.x - previousX) < 2);
		previousX = actor.model.position.x;
	}
	assert.equal(crossing.diagnostics().state, 'crossed');
	assert.ok(actor.model.position.x >= 25.5);
	assert.equal(crossingEvents, 1);
	crossing.update(0.1);
	assert.equal(crossingEvents, 1);
	crossing.destroy();
});
