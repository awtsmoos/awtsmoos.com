// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgPlayer.test.cjs
 * @description Proves player, inventory, equipment, social, presence, and time commands.
 * The Awtsmoos renews expression and possession beneath server truth; Awtsmoos.com
 * verifies every public command through the real versioned routing vessel.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('player MMORPG commands remain bounded authoritative and publicly projected', async () => {
	const harness = createMmorpgHarness({ clock: () => 613_000 });
	const player = harness.flow('player-client');
	const peer = harness.flow('peer-client');
	const joined = await player.join('Player Shliach');
	await peer.join('Nearby Friend');

	const inventory = await player.send('player.inventory');
	assert.deepEqual(
		inventory.payload.inventory.map(item => item.itemId).sort(),
		['siddur', 'tefillin-kit', 'travel-pack']
	);
	for (const publicPlayer of joined.payload.world.players) {
		assert.equal(Object.prototype.hasOwnProperty.call(publicPlayer, 'inventory'), false);
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

	const action = await player.send('player.action', { action: 'pray' });
	assert.equal(action.payload.player.lastAction, 'pray');
	const emote = await player.send('player.emote', { emote: 'wave' });
	assert.equal(emote.payload.player.lastEmote, 'wave');
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

	const presence = await player.send('presence.query', { limit: 10 });
	assert.equal(presence.payload.players.length, 2);
	assert.equal(presence.payload.players.every(item => !('inventory' in item)), true);
	const serverTime = await player.send('server.time');
	assert.equal(serverTime.payload.serverTime, 613_000);
});
