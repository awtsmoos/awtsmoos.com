// B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const { readFrame } = require('./frameReader.js');
const { sendFrame } = require('./frameWriter.js');
const Limits = require('./frameLimits.js');
const Live = require('./clientLiveness.js');
const { dispatchClientFrame } = require('./frameDispatch.js');
const { collectTextMessage } = require('./textFragments.js');

/**
 * @file Owns one bounded socket client, its liveness, fragments, and trusted identity.
 * @description The Awtsmoos renews chunk, frame, and authenticated account as
 * separate measured vessels. Awtsmoos.com stores only frozen sanitized identity,
 * while established buffering, aliases, and eight-megabyte responses remain intact.
 */

const MAXIMUM_BUFFER_BYTES = Limits.maximumBufferBytes();
const MAXIMUM_PAYLOAD_BYTES = Limits.maximumPayloadBytes();

function trustedIdentity(metadata = {}) {
	return metadata.identity
		? Object.freeze({ ...metadata.identity })
		: null;
}

function createSocketClient(socket, metadata = {}) {
	const client = {
		aliasId: null,
		buffer: Buffer.alloc(0),
		fragmentOpcode: null,
		fragments: [],
		id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
		identity: trustedIdentity(metadata),
		isAlive: true,
		lastTransportError: '',
		socket,
		send(message) {
			const payload = typeof message === 'string'
				? message
				: JSON.stringify(message);
			sendFrame(socket, payload);
		}
	};
	Live.markSeen(client);
	return client;
}

function attachSocketClient(server, client, head) {
	if (head?.length) processClientBuffer(server, client, head);
	client.socket.on('data', (chunk) => {
		processClientBuffer(server, client, chunk);
	});
	client.socket.on('close', () => {
		server.removeClient(client);
	});
	client.socket.on('error', (error) => {
		client.lastTransportError = `socket_error:${error.message}`;
		server.removeClient(client);
	});
}

function processClientBuffer(server, client, chunk) {
	Live.markSeen(client);
	const currentLength = client.buffer?.length || 0;
	if (currentLength + chunk.length > MAXIMUM_BUFFER_BYTES) {
		closeForTransportError(
			client,
			`websocket_buffer_exceeds_limit:${currentLength + chunk.length}:${MAXIMUM_BUFFER_BYTES}`
		);
		return;
	}
	client.buffer = Buffer.concat([client.buffer || Buffer.alloc(0), chunk]);
	while (client.buffer.length) {
		let parsed;
		try {
			parsed = readFrame(client.buffer, {
				maximumPayloadBytes: MAXIMUM_PAYLOAD_BYTES
			});
		} catch (error) {
			closeForTransportError(client, error.message);
			return;
		}
		if (!parsed) return;
		client.buffer = client.buffer.subarray(parsed.consumed);
		dispatchClientFrame(server, client, parsed.frame);
	}
}

function closeForTransportError(client, reason) {
	client.lastTransportError = String(reason || 'websocket_transport_error');
	console.error('B"H WS TRANSPORT CLOSE', {
		clientId: client.id,
		reason: client.lastTransportError
	});
	try {
		client.socket.end();
	} catch {}
}

module.exports = {
	MAXIMUM_BUFFER_BYTES,
	MAXIMUM_PAYLOAD_BYTES,
	attachSocketClient,
	closeForTransportError,
	collectClientMessage: collectTextMessage,
	createSocketClient,
	handleClientFrame: dispatchClientFrame,
	processClientBuffer
};
