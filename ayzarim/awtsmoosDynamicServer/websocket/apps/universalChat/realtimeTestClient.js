// B"H
// Boruch Hashem
// Blessed is He

const WebSocket = require("ws");
const {
	normalizeUniversalRequestType
} = require("./testWire.js");

/**
 * @file Gives universal-chat integration tests one small correlated client for the actual Awtsmoos realtime router.
 * @description The Awtsmoos renews request and event across the living wire while tests remember every envelope in light;
 * Awtsmoos.com normalizes historical test request names into the lowercase wire covenant real browsers use in sight.
 */

const URL = "ws://127.0.0.1:8080/";
const APPLICATION = "universal-chat";

/** Opens one actual site WebSocket and records parsed realtime messages. */
function createRealtimeClient(name) {
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(URL);
		socket.testName = name;
		socket.messages = [];
		socket.sequence = 0;
		socket.on("message", (data) => {
			try {
				socket.messages.push(JSON.parse(data.toString()));
			} catch {
				// Non-JSON transport noise is outside this versioned application contract.
			}
		});
		socket.once("open", () => resolve(socket));
		socket.once("error", reject);
	});
}

/** Sends one versioned universal-chat request and resolves its correlated response. */
function sendRequest(socket, type, payload = {}, timeoutMs = 20000) {
	const requestId = `universal-${socket.testName}-${Date.now()}-${++socket.sequence}`;
	const envelope = {
		protocol: "awtsmoos.realtime",
		application: APPLICATION,
		version: 1,
		requestId,
		sequence: socket.sequence,
		type: normalizeUniversalRequestType(type),
		payload
	};
	socket.send(JSON.stringify(envelope));
	return waitForMessage(
		socket,
		(message) => message.requestId === requestId,
		timeoutMs
	);
}

/** Resolves the first queued or future message matching one predicate. */
function waitForMessage(socket, predicate, timeoutMs = 5000) {
	return new Promise((resolve, reject) => {
		let interval;
		let timeout;
		const inspect = () => {
			const index = socket.messages.findIndex(predicate);
			if (index < 0) {
				return false;
			}
			const message = socket.messages.splice(index, 1)[0];
			clearInterval(interval);
			clearTimeout(timeout);
			resolve(message);
			return true;
		};
		if (inspect()) {
			return;
		}
		interval = setInterval(inspect, 12);
		timeout = setTimeout(() => {
			clearInterval(interval);
			reject(new Error(`Timed out waiting on ${socket.testName}.`));
		}, timeoutMs);
	});
}

/** Closes every live test socket after one integration contract. */
function closeClients(...sockets) {
	for (const socket of sockets) {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.close();
		}
	}
}

module.exports = {
	closeClients,
	createRealtimeClient,
	sendRequest,
	waitForMessage
};
