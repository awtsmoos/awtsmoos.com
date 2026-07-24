//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { mintItem } from '../js/realm/account/item-instance-factory.js';
import { createRealmState, normalizeRealmState } from '../js/realm/realm-state.js';

/**
 * @module AccountStateMigrationTest
 * @description
 * Old civic memory must cross into account identity without losing bridge, home,
 * people, inventory, or history. The Awtsmoos renews old and new together while
 * Awtsmoos.com proves version, ownership, skill, bank, health, and route integrity.
 */
test('version-one civic state migrates into complete version-two identity', () => {
	const old = {
		version: 1,
		player: {
			inventory: { coin: 41, timber: 7 },
			skills: { rescue: { id: 'rescue', level: 4, xp: 200, mastery: 30, recentActions: ['search'] } }
		},
		bridge: { complete: true, timber: 8, timberRequired: 8, stone: 6, stoneRequired: 6 },
		home: { condition: 91, level: 2, workshop: 2, features: ['rest-space', 'workshop'], stories: [] },
		memory: [{ id: 'old-memory', type: 'aid', sourceId: 'player-one', targetId: 'realm-person-1', summary: 'Helped Ari.', importance: 80, minute: 500 }],
		actionCount: 12
	};
	const state = normalizeRealmState(old);
	assert.equal(state.version, 2);
	assert.equal(state.player.inventory.coin, 41);
	assert.equal(state.player.skills.rescue.level, 4);
	assert.equal(Object.keys(state.player.skills).length, 10);
	assert.equal(state.bridge.complete, true);
	assert.equal(state.home.workshop, 2);
	assert.equal(state.memory[0].id, 'old-memory');
	assert.equal(state.actionCount, 12);
	assert.equal(state.player.itemIds.length, 5);
	assert.equal(Object.keys(state.equipment).length, 9);
	assert.ok(state.bank && state.vitals && state.quests && state.collections);
});

test('migration never leaves one item in carried and bank custody', () => {
	const fresh = createRealmState();
	const itemId = fresh.player.itemIds[3];
	const migrated = normalizeRealmState({
		...fresh,
		bank: { ...fresh.bank, itemIds: [itemId] }
	});
	assert.ok(migrated.player.itemIds.includes(itemId));
	assert.ok(!migrated.bank.itemIds.includes(itemId));
});

test('minted equipment receives unique identity and provenance', () => {
	const state = createRealmState();
	const first = mintItem(state, 'evidence-lens', 'Recovered from the court archive');
	const second = mintItem(first.state, 'road-warden-staff', 'Granted after the north-road peace');
	assert.notEqual(first.itemId, second.itemId);
	assert.equal(second.state.items[first.itemId].provenance, 'Recovered from the court archive');
	assert.equal(second.state.items[second.itemId].definitionId, 'road-warden-staff');
	assert.equal(second.state.account.nextItemSerial, state.account.nextItemSerial + 2);
});
