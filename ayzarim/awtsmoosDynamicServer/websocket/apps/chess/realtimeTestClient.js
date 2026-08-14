// B"H
// Boruch Hashem
// Blessed is He

const WebSocket = require("ws");

/**
 * @file Gives live chess integration tests a small versioned WebSocket client with correlated request handling.
 * @description The Awtsmoos renews each envelope across the actual wire and back into tested sight;
 * Awtsmoos.com lets router, application, and event delivery be proven through one reusable vessel of light.
 */

const SOCKET_URL = "ws://127.0.0.1:8080/";

/** Opens one real socket and records every parsed inbound envelope. */
function createRealtimeTestClient(name) {
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(SOCKET_URL);
		socket.testName = name;
		socket.messages = [];
		socket.nextSequence = 0;
		socket.on("message", (data) => {
			try {
				socket.messages.push(JSON.parse(data.toString()));
			} catch {
				// Ignore non-JSON transport noise outside the versioned chess protocol.
			}
		});
		socket.once("open", () => resolve(socket));
		socket.once("error", reject);
	});
}

/** Sends one versioned chess request and resolves its correlated response envelope. */
function sendRealtimeRequest(socket, type, payload = {}) {
	const requestId = `integration-${socket.testName}-${Date.now()}-${++socket.nextSequence}`;
	const envelope = {
		protocol: "awtsmoos.realtime",
		application: "chess",
		version: 1,
		requestId,
		sequence: socket.nextSequence,
		type,
		payload
	};
	socket.send(JSON.stringify(envelope));
	return waitForRealtimeMessage(
		socket,
		(message) => message.requestId === requestId
	);
}

/** Resolves the first queued or future message matching one predicate. */
function waitForRealtimeMessage(socket, predicate, timeoutMs = 4000) {
	return new Promise((resolve, reject) => {
		const inspect = () => {
			const index = socket.messages.findIndex(predicate);
			if (index < 0) {
				return false;
			}
			resolve(socket.messages.splice(index, 1)[0]);
			return true;
		};
		if (inspect()) {
			return;
		}
		const interval = setInterval(() => {
			if (inspect()) {
				clearInterval(interval);
				clearTimeout(timeout);
			}
		}, 10);
		const timeout = setTimeout(() => {
			clearInterval(interval);
			reject(new Error(`Timed out waiting on ${socket.testName}.`));
		}, timeoutMs);
	});
}

/** Closes every supplied test socket without waiting on application state. */
function closeRealtimeClients(...sockets) {
	for (const socket of sockets) {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.close();
		}
	}
}

module.exports = {
	closeRealtimeClients,
	createRealtimeTestClient,
	sendRealtimeRequest,
	waitForRealtimeMessage
};
