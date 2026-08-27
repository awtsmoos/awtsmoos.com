// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgPlayer.test.cjs
 * @description Proves complete starter equipment and bounded public player commands.
 * The Awtsmoos renews expression and possession beneath server truth; Awtsmoos.com
 * verifies expanded gear privately while every shared projection remains safely bounded.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

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

test('player MMORPG commands remain bounded authoritative and publicly projected', async () => {
	const harness = createMmorpgHarness({ clock: () => 613_000 });
	const player = harness.flow('player-client');
	const peer = harness.flow('peer-client');
	const joined = await player.join('Player Shliach');
	await peer.join('Nearby Friend');
	const inventory = await player.send('player.inventory');
	assert.deepEqual(
		inventory.payload.inventory.map(item => item.itemId).sort(),
		STARTER_ITEMS
	);
	for (const publicPlayer of joined.payload.world.players) {
		assert.equal(Object.hasOwn(publicPlayer, 'inventory'), false);
	}
	const equipped = await player.send('player.equipment', {
		itemId: 'siddur',
		operation: 'equip'
	});
	assert.equal(equipped.payload.equipment.hand, 'siddur');
	const profile = await player.send('player.profile', {
		operation: 'update',
		status: 'away'
	});
	assert.equal(profile.payload.profile.status, 'away');
	assert.equal((await player.send('player.action', { action: 'pray' })).payload.player.lastAction, 'pray');
	assert.equal((await player.send('player.emote', { emote: 'wave' })).payload.player.lastEmote, 'wave');
	const interaction = await player.send('player.interact', {
		action: 'greet',
		targetId: 'rabbi-dov-ber'
	});
	assert.equal(interaction.payload.target.id, 'rabbi-dov-ber');
	const chat = await player.send('player.chat', { message: 'Shalom from the village' });
	assert.equal(chat.payload.message, 'Shalom from the village');
	assert.equal(peer.latest('player.chat').payload.from.id, joined.payload.playerId);
	const respawn = await player.send('player.respawn');
	assert.deepEqual(respawn.payload.player.position, { x: 0, y: 0, z: 0 });
	assert.equal(respawn.payload.player.combat.health, 100);
	const presence = await player.send('presence.query', { limit: 10 });
	assert.equal(presence.payload.players.length, 2);
	assert.equal(presence.payload.players.every(item => !('inventory' in item)), true);
	assert.equal((await player.send('server.time')).payload.serverTime, 613_000);
});
