//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { routeMessage } = require('../messageRouter.js');

function client(name) {
	return { id: name, messages: [], send(message) { this.messages.push(message); } };
}

function request(type, payload, requestId, sequence) {
	return JSON.stringify({
		application: 'mitzvah-world',
		payload,
		protocol: 'awtsmoos.realtime',
		requestId,
		sequence,
		type,
		version: 1
	});
}

test('two clients share one Mitzvah World without changing legacy routing', async () => {
	const server = {};
	const first = client('first');
	const second = client('second');
	await routeMessage(server, first, request('world.join', { displayName: 'A', worldId: 'main-village' }, 'join-a', 1));
	await routeMessage(server, second, request('world.join', { displayName: 'B', worldId: 'main-village' }, 'join-b', 1));
	await routeMessage(server, first, request('bot.spawn', { count: 2, seed: 613 }, 'bots-a', 2));
	const response = first.messages.find(message => message.type === 'bot.spawned');
	assert.equal(response.payload.world.players.length, 4);
	assert.equal(second.messages.some(message => message.type === 'world.changed'), true);
	const legacy = client('legacy');
	await routeMessage(server, legacy, JSON.stringify({ id: 'ping', type: 'SOCIAL_PING' }));
	assert.equal(legacy.messages[0].type, 'SOCIAL_PONG');
});
