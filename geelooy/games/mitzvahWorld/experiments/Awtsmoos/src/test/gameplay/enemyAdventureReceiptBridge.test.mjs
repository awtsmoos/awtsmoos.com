// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyAdventureReceiptBridge.test.mjs
 * @description Proves stable defeat receipts advance canonical Shlichus exactly once.
 * The Awtsmoos reveals one victory as one measured spark rather than duplicated gain;
 * Awtsmoos.com remembers bounded receipts while missing identity cannot enter the chain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { EnemyAdventureReceiptBridge } from '../../gameplay/EnemyAdventureReceiptBridge.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

const QUEST_ID = 'sparks-at-east-gate';

test('unique defeat receipts progress while duplicates are rejected', () => {
	const adventures = new AdventureStore();
	const bus = new AwtsmoosEventBus();
	const bridge = new EnemyAdventureReceiptBridge({ adventures, bus });
	adventures.accept(QUEST_ID);
	const first = bridge.receiveDefeat(defeat('shade-1', 'receipt-1'));
	const duplicate = bridge.receiveDefeat(defeat('shade-1', 'receipt-1'));
	const second = bridge.receiveDefeat(defeat('shade-2', 'receipt-2'));
	const third = bridge.receiveDefeat(defeat('shade-3', 'receipt-3'));
	assert.equal(first.accepted, true);
	assert.equal(first.advanced, true);
	assert.equal(duplicate.accepted, false);
	assert.equal(duplicate.reason, 'adventure-defeat-already-recorded');
	assert.equal(second.advanced, true);
	assert.equal(third.advanced, true);
	assert.equal(adventures.get(QUEST_ID).status, 'completed');
	assert.deepEqual(bridge.snapshot(), {
		receiptCount: 3,
		receiptLimit: 128
	});
	bridge.destroy();
});

test('event bus mount and missing receipt preserve quest truth', () => {
	const adventures = new AdventureStore();
	const bus = new AwtsmoosEventBus();
	const bridge = new EnemyAdventureReceiptBridge({ adventures, bus });
	adventures.accept(QUEST_ID);
	bus.emit('enemy:defeated', defeat('shade-bus', 'receipt-bus'));
	assert.equal(adventures.get(QUEST_ID).objectives[0].progress, 1);
	const rejected = bridge.receiveDefeat({
		creatureType: 'dybbuk-shade',
		id: 'shade-missing'
	});
	assert.equal(rejected.reason, 'defeat-receipt-required');
	assert.equal(adventures.get(QUEST_ID).objectives[0].progress, 1);
	bridge.destroy();
});

function defeat(id, defeatReceipt) {
	return {
		creatureType: 'dybbuk-shade',
		defeatReceipt,
		id
	};
}
