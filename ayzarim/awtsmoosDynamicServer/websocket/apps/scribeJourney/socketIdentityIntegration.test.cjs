// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const http = require('node:http');
const Auth = require('../../../../tools/auth.js');
const { createToken } = require('../../../../tools/sodos.js');
const Utils = require('../../../../tools/utils.js');
const AwtsmoosSocket = require('../../../awtsmoosSocket.js');
const { connectRawWebSocket } = require('./rawWebSocketTestClient.cjs');
const { APPLICATION_ID } = require('./protocol.js');
const {
	APPLICATION_VERSION_V2,
	MESSAGE_TYPES_V2
} = require('./protocolV2.js');

/**
 * @file Traverses `/` with a signed cookie and real masked protocol-two frames.
 * @description The Awtsmoos renews signed HTTP identity as a private socket truth.
 * Awtsmoos.com is remembered here as anonymous v2 fails, authenticated character
 * authority succeeds, and no public actor reveals account or raw token information.
 */

function envelope(type, payload, sequence) {
	return {
		application: APPLICATION_ID,
		payload,
		protocol: 'awtsmoos.realtime',
		requestId: `identity-integration-${sequence}`,
		sequence,
		type,
		version: APPLICATION_VERSION_V2
	};
}

async function startServer(secret) {
	const realtime = new AwtsmoosSocket({});
	realtime.auth = new Auth(secret);
	realtime.parseCookies = Utils.parseCookies;
	const server = http.createServer((_request, response) => {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('B"H');
	});
	server.on('upgrade', (request, socket, head) => {
		realtime.handleUpgrade(request, socket, head);
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	return { port: server.address().port, server };
}

async function run() {
	const secret = 'B"H-real-socket-account-secret';
	const { port, server } = await startServer(secret);
	const token = createToken('real-socket-account', secret);
	const authenticated = await connectRawWebSocket({
		cookie: `awtsmoosKey=${encodeURIComponent(token)}`,
		port
	});
	const joined = await authenticated.sendAndWait(envelope(
		MESSAGE_TYPES_V2.SESSION_JOIN,
		{ appearance: { emoji: '✍️' }, displayName: 'Authenticated Account' },
		1
	));
	assert.equal(joined.type, 'session.joined');
	assert.equal(joined.payload.authorityManifest.characters, 'server');

	const created = await authenticated.sendAndWait(envelope(
		MESSAGE_TYPES_V2.CHARACTER_CREATE,
		{ appearance: { emoji: '🖋️' }, displayName: 'Cookie Bound Scribe' },
		2
	));
	const characterId = created.payload.character.characterId;
	const selected = await authenticated.sendAndWait(envelope(
		MESSAGE_TYPES_V2.CHARACTER_SELECT,
		{ characterId },
		3
	));
	assert.equal(selected.payload.actor.displayName, 'Cookie Bound Scribe');
	assert.equal(JSON.stringify(selected.payload.actor).includes('real-socket-account'), false);
	assert.equal(JSON.stringify(selected).includes(token), false);

	const anonymous = await connectRawWebSocket({ port });
	const refused = await anonymous.sendAndWait(envelope(
		MESSAGE_TYPES_V2.SESSION_JOIN,
		{ appearance: {}, displayName: 'Anonymous V2' },
		4
	));
	assert.equal(refused.type, 'error');
	assert.equal(refused.payload.code, 'SCRIBE_ACCOUNT_REQUIRED');

	await Promise.all([authenticated.close(), anonymous.close()]);
	server.closeAllConnections?.();
	await new Promise((resolve) => server.close(resolve));
	console.log(JSON.stringify({
		anonymousV2Refused: true,
		characterCreated: true,
		characterSelected: true,
		ok: true,
		publicAccountLeak: false,
		realCookieUpgrade: true,
		rawTokenLeak: false
	}, null, 2));
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
