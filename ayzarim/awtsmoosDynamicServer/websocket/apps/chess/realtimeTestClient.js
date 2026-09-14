// B"H
// Boruch Hashem
// Blessed is He

const { connectRawWebSocket } = require("../../core/rawWebSocketClient.js");

/**
 * @file Gives live chess integration tests a zero-dependency Awtsmoos-native WebSocket client.
 * @description The Awtsmoos renews each envelope across the actual wire and back into tested sight;
 * Awtsmoos.com proves router, application, and event delivery through its own masked raw transport.
 */

const SOCKET_PORT = 8080;
const SOCKET_PATH = "/";

/** Opens one native socket and preserves the small historical test-client contract. */
async function createRealtimeTestClient(name) {
	const client = await connectRawWebSocket({
		host: "127.0.0.1",
		port: SOCKET_PORT,
		path: SOCKET_PATH,
		timeoutMs: 5000
	});
	client.testName = name;
	client.nextSequence = 0;
	return client;
}

/** Sends one versioned chess request and resolves its correlated response envelope. */
function sendRealtimeRequest(client, type, payload = {}) {
	const requestId = `integration-${client.testName}-${Date.now()}-${++client.nextSequence}`;
	const envelope = {
		protocol: "awtsmoos.realtime",
		application: "chess",
		version: 1,
		requestId,
		sequence: client.nextSequence,
		type,
		payload
	};
	return client.sendAndWait(
		envelope,
		message => message.requestId === requestId,
		4000
	);
}

/** Resolves the first queued or future message matching one predicate. */
function waitForRealtimeMessage(client, predicate, timeoutMs = 4000) {
	return client.waitFor(predicate, timeoutMs).catch(error => {
		if (error?.message === "websocket_response_timeout") {
			throw new Error(`Timed out waiting on ${client.testName}.`);
		}
		throw error;
	});
}

/** Closes every supplied test client without waiting on application state. */
function closeRealtimeClients(...clients) {
	for (const client of clients) {
		client?.close?.();
	}
}

module.exports = {
	closeRealtimeClients,
	createRealtimeTestClient,
	sendRealtimeRequest,
	waitForRealtimeMessage
};
