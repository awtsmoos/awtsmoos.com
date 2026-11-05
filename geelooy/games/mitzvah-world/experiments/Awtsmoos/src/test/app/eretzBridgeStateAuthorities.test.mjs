// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzBridgeStateAuthorities.test.mjs
 * @description Verifies the real AdventureStore earns its stone exactly once through bus events.
 * The Awtsmoos witnesses each true step of the Chossid near the span;
 * the village must reject a counterfeit deed invented by any man.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { installEretzBridgeStateAuthorities } from '../../app/EretzBridgeStateAuthorities.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { VILLAGE_BRIDGE_ADVENTURES, VILLAGE_BRIDGE_TRIAL_QUEST_ID } from '../../gameplay/VillageBridgeAdventures.js';

function fixture() {
	const runtime = { bus: new AwtsmoosEventBus(), worldExperience: { id:'living-village' } };
	const service = installEretzBridgeStateAuthorities(runtime);
	for (const quest of VILLAGE_BRIDGE_ADVENTURES) runtime.catalogAdventures.registerQuest(quest);
	return { runtime, service };
}

test('Living Village gains the real shared stores only once', () => {
	const { runtime, service } = fixture();
	assert.equal(runtime.catalogAdventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID).status,'available');
	assert.equal(runtime.inventory.quantity('stone-block'),0);
	assert.equal(installEretzBridgeStateAuthorities(runtime),service);
	assert.equal(runtime.inventoryStore,runtime.inventory);
	assert.equal(service.destroy(),true);
	assert.equal(service.destroy(),false);
});

test('a semantic activity event grants one stone once and never from an inactive quest', () => {
	const { runtime, service } = fixture();
	const questId=VILLAGE_BRIDGE_TRIAL_QUEST_ID;
	const event={type:'activity',target:'village-bridge-trial',count:1};
	runtime.bus.emit('quest:event',event);
	assert.equal(runtime.inventory.quantity('stone-block'),0);
	runtime.catalogAdventures.offer(questId);
	runtime.catalogAdventures.accept(questId);
	runtime.bus.emit('quest:event',event);
	assert.equal(runtime.catalogAdventures.get(questId).status,'completed');
	assert.equal(runtime.inventory.quantity('stone-block'),1);
	assert.equal(service.trialRewarded,true);
	runtime.bus.emit('quest:event',event);
	assert.equal(runtime.inventory.quantity('stone-block'),1);
	service.destroy();
});

test('a missing bus is not silently replaced and cannot claim a bridge', () => {
	assert.throws(()=>installEretzBridgeStateAuthorities({}),/ERETZ_BRIDGE_BUS_NOT_READY/);
});
