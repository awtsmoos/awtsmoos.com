// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const http = require('node:http');
const AwtsmoosSocket = require('../../../awtsmoosSocket.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION,
	MESSAGE_TYPES
} = require('./protocol.js');

/**
 * @file Traverses the unchanged HTTP upgrade path with a real WebSocket client.
 * @description The Awtsmoos renews handshake, frame, router, application, room,
 * and response as one living proof. Awtsmoos.com is remembered here as the custom
 * world selects its namespace over `/` without stealing any historical route.
 */

function envelope(type, payload, sequence) {
	return {
		application: APPLICATION_ID,
		payload,
		protocol: 'awtsmoos.realtime',
		requestId: `integration-${sequence}`,
		sequence,
		type,
		version: APPLICATION_VERSION
	};
}

function sendAndWait(socket, type, payload, sequence) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${type}.`)), 3000);
		function onMessage(event) {
			const message = JSON.parse(String(event.data));
			if (message.requestId !== `integration-${sequence}`) {
				return;
			}
			clearTimeout(timeout);
			socket.removeEventListener('message', onMessage);
			resolve(message);
		}
		socket.addEventListener('message', onMessage);
		socket.send(JSON.stringify(envelope(type, payload, sequence)));
	});
}

async function run() {
	const realtime = new AwtsmoosSocket({});
	const server = http.createServer((_request, response) => {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('B"H');
	});
	server.on('upgrade', (request, socket, head) => {
		realtime.handleUpgrade(request, socket, head);
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	const socket = new WebSocket(`ws://127.0.0.1:${address.port}/`);
	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', reject, { once: true });
	});

	const joined = await sendAndWait(socket, MESSAGE_TYPES.SESSION_JOIN, {
		appearance: { accent: '#78dce8', emoji: '✍️', title: 'Integration Scribe' },
		displayName: 'Socket Witness'
	}, 1);
	assert.equal(joined.type, 'session.joined');
	assert.equal(joined.application, APPLICATION_ID);

	const world = await sendAndWait(socket, MESSAGE_TYPES.WORLD_JOIN, {
		direction: 'down',
		mapId: 'malkuth_village',
		x: 5,
		y: 8
	}, 2);
	assert.equal(world.type, 'world.joined');
	assert.equal(world.payload.room.mapId, 'malkuth_village');
	assert.equal(world.payload.room.actors.some((actor) => actor.actorKind === 'ai'), true);
	assert.equal(world.payload.room.actors.some((actor) => actor.actorKind === 'human'), true);

	socket.close();
	await new Promise((resolve) => server.close(resolve));
	console.log(JSON.stringify({
		ok: true,
		upgradePath: '/',
		application: APPLICATION_ID,
		version: APPLICATION_VERSION,
		realHandshake: true,
		realFrameRouting: true,
		roomSnapshot: true,
		aiDisclosure: true
	}, null, 2));
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
