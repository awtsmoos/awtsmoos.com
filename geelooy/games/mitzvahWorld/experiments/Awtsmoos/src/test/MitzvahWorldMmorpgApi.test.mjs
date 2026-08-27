// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldMmorpgApi.test.mjs
 * @description Proves the browser MMORPG facade against the real server application.
 * The Awtsmoos renews interface and authority together; Awtsmoos.com follows complete starter
 * equipment, social intent, bots, parties, instances, presence, and bounded public truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

const STARTER_ITEMS = Object.freeze([
	'base-shirt',
	'black-coat',
	'black-trousers',
	'chalaf',
	'scholar-glasses',
	'shabbos-top-hat',
	'siddur',
	'spark-blade',
	'tefillin-kit',
	'travel-pack',
	'village-shield',
	'walking-boots',
	'white-outer-shirt',
	'wooden-staff'
]);

test('browser facade drives player social item bot party instance and presence commands', async () => {
	const harness = createBridgeHarness({ clock: () => 770_000 });
	const first = new MitzvahWorldRealtimeClient(harness.createSocket('facade-first'));
	const second = new MitzvahWorldRealtimeClient(harness.createSocket('facade-second'));
	const firstJoin = await first.join('Facade Leader');
	const secondJoin = await second.join('Facade Member');
	const inventory = await first.mmorpg.inventory();
	assert.deepEqual(
		inventory.payload.inventory.map(item => item.itemId).sort(),
		STARTER_ITEMS
	);
	const equipment = await first.mmorpg.equipment('equip', 'siddur');
	assert.equal(equipment.payload.equipment.hand, 'siddur');
	assert.equal((await first.mmorpg.profile('away')).payload.profile.status, 'away');
	assert.equal((await first.mmorpg.action('pray')).payload.player.lastAction, 'pray');
	assert.equal((await first.mmorpg.emote('wave')).payload.player.lastEmote, 'wave');
	const party = await first.mmorpg.createParty();
	await first.mmorpg.inviteToParty(secondJoin.payload.playerId);
	await second.mmorpg.joinParty(party.payload.party.id);
	assert.equal((await second.mmorpg.partySnapshot()).payload.party.memberIds.length, 2);
	const instance = await first.mmorpg.enterInstance('facade-mission');
	await second.mmorpg.enterInstance(null, instance.payload.instance.id);
	assert.equal((await second.mmorpg.instanceSnapshot()).payload.memberIds.length, 2);
	const spawned = await first.spawnBots(1, 613, 'Facade Bot');
	const botId = spawned.payload.bots[0].id;
	const command = await first.mmorpg.commandBot(botId, 'travel', { x: 6, z: 2 });
	assert.equal(command.payload.brain.command.type, 'travel');
	assert.equal((await first.mmorpg.removeBot(botId)).payload.removed, true);
	assert.equal((await first.mmorpg.presence()).payload.players.length, 2);
	assert.equal((await first.mmorpg.serverTime()).payload.serverTime, 770_000);
	assert.notEqual(firstJoin.payload.playerId, secondJoin.payload.playerId);
});
