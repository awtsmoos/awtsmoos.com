// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldCensusChat.test.cjs
 * @description Proves anonymous census plus global, world, and legacy chat delivery.
 * The Awtsmoos renews connected presence without inventing identity; Awtsmoos.com
 * verifies aggregate counts and keeps world speech bounded to its intended audience.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('anonymous census counts attached humans without creating player state', async () => {
	const harness = createMmorpgHarness({ clock: () => 613_000 });
	const census = harness.flow('anonymous-census');
	const before = await census.send('world.census');
	assert.equal(before.type, 'world.census');
	assert.equal(before.payload.connected, 0);
	assert.equal(harness.directory.sessions.sessions.size, 0);

	const mainOne = harness.flow('main-one');
	const mainTwo = harness.flow('main-two');
	const quiet = harness.flow('quiet-one');
	await mainOne.join('Main One');
	await mainTwo.join('Main Two');
	await quiet.join('Quiet One', 'quiet-village');
	const after = await harness.flow('anonymous-after').send('world.census');
	assert.equal(after.payload.connected, 3);
	assert.equal(worldCount(after, 'main-village'), 2);
	assert.equal(worldCount(after, 'quiet-village'), 1);
	assert.equal(after.payload.worlds.every(world => !('players' in world)), true);
});

test('world chat stays local while global and legacy chat retain contracts', async () => {
	const harness = createMmorpgHarness({ clock: () => 777_000 });
	const mainOne = harness.flow('chat-main-one');
	const mainTwo = harness.flow('chat-main-two');
	const quiet = harness.flow('chat-quiet');
	const mainJoin = await mainOne.join('Main One');
	await mainTwo.join('Main Two');
	await quiet.join('Quiet One', 'quiet-village');
	clearEvents(mainOne, mainTwo, quiet);

	const world = await mainOne.send('chat.send', {
		message: 'Only the mountain village hears this.',
		scope: 'world'
	});
	assert.equal(world.type, 'chat.sent');
	assert.equal(mainTwo.latest('chat.message').payload.id, world.payload.id);
	assert.equal(quiet.latest('chat.message'), null);

	clearEvents(mainOne, mainTwo, quiet);
	const global = await mainOne.send('chat.send', {
		message: 'Every connected world hears this.',
		scope: 'global'
	});
	for (const flow of [mainOne, mainTwo, quiet]) {
		assert.equal(flow.latest('chat.message').payload.id, global.payload.id);
	}

	clearEvents(mainOne, mainTwo, quiet);
	const legacy = await mainOne.send('player.chat', { message: 'Legacy shalom' });
	assert.equal(legacy.type, 'player.chat.accepted');
	assert.equal(mainTwo.latest('player.chat').payload.from.id, mainJoin.payload.playerId);
	assert.equal(quiet.latest('player.chat'), null);
});

function worldCount(response, worldId) {
	return response.payload.worlds.find(world => world.id === worldId)?.connected;
}

function clearEvents(...flows) {
	for (const flow of flows) flow.client.messages.length = 0;
}
