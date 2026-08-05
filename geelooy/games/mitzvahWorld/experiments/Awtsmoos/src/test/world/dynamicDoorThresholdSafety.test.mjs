// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file dynamicDoorThresholdSafety.test.mjs
 * @description Proves clear closes, occupied-sweep refusal, receipts, and bounded retry.
 * The Awtsmoos grants passage without letting the finite leaf cross the traveler;
 * Awtsmoos.com records obstruction and waits a measured season before trying later.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { DynamicDoor3D } from '../../world/DynamicDoor3D.js';
import { tallDoorDef } from '../../world/DoorwaySpecs.js';

test('clear player position accepts close and preserves boolean contract', () => {
	const fixture = createOpenDoor({ x: 100, y: 1, z: 100 });
	const receipt = fixture.door.requestClose('test-clear');
	assert.equal(receipt.accepted, true);
	assert.equal(receipt.reason, 'closing-accepted');
	assert.equal(fixture.door.state, 'closing');
	fixture.door.update(1);
	assert.equal(fixture.door.state, 'closed');
	assert.equal(fixture.door.open('boolean-open'), true);
	fixture.door.update(1);
	assert.equal(fixture.door.close('boolean-close'), true);
});

test('player in sampled hinge sweep blocks close and emits receipts', () => {
	const blockedEvents = [];
	const closeEvents = [];
	const definition = tallDoorDef();
	const player = { ...definition.frame.panel.closedCenter };
	const fixture = createOpenDoor(player, definition);
	fixture.bus.on('door:blocked', receipt => blockedEvents.push(receipt));
	fixture.bus.on('door:close-receipt', receipt => closeEvents.push(receipt));
	const receipt = fixture.door.requestClose('test-blocked');
	assert.equal(receipt.accepted, false);
	assert.equal(receipt.reason, 'player-in-closing-sweep');
	assert.equal(fixture.door.state, 'open');
	assert.equal(receipt.safety.blocked, true);
	assert.equal(blockedEvents.length, 1);
	assert.equal(closeEvents.length, 1);
	assert.equal(fixture.door.debug().lastCloseReceipt, receipt);
});

test('blocked auto-close waits before retry and closes after player moves', () => {
	const base = tallDoorDef();
	const definition = {
		...base,
		autoCloseSeconds: 0.1,
		blockedRetrySeconds: 0.25
	};
	const player = { ...base.frame.panel.closedCenter };
	const fixture = createOpenDoor(player, definition);
	fixture.door.update(0.11);
	assert.equal(fixture.door.state, 'open');
	assert.ok(fixture.door.autoCloseRemaining > 0.24);
	const receipt = fixture.door.lastCloseReceipt;
	fixture.door.update(0.1);
	assert.equal(fixture.door.lastCloseReceipt, receipt);
	assert.equal(fixture.door.state, 'open');
	Object.assign(player, { x: 100, y: 1, z: 100 });
	fixture.door.update(0.16);
	assert.equal(fixture.door.state, 'closing');
	assert.equal(fixture.door.lastCloseReceipt.accepted, true);
});

function createOpenDoor(player, definition = tallDoorDef()) {
	const bus = new AwtsmoosEventBus();
	const door = new DynamicDoor3D(definition);
	door.setInteractionContext({
		bus,
		getPlayerPosition: () => player,
		playerHeight: 1.8,
		playerRadius: 0.42
	});
	assert.equal(door.open('fixture'), true);
	door.update(1);
	assert.equal(door.state, 'open');
	return { bus, door };
}
