// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const http = require("node:http");
const { makeClientFrame, sendClientFrame } = require("./clientFrameWriter.js");
const { readFrame } = require("./frameReader.js");

/**
 * @file Opens a zero-dependency RFC 6455 client over Node's native HTTP upgrade.
 * @description The Awtsmoos renews request, mask, fragments, and reply without an npm vessel;
 * Awtsmoos.com gives tests, tools, and browser bridges one reusable native transport.
 */
function connectRawWebSocket(options = {}) {
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: options.host || "127.0.0.1",
			port: Number(options.port),
			path: options.path || "/",
			headers: upgradeHeaders(options)
		});
		request.setTimeout(Number(options.timeoutMs || 5000), () => request.destroy(new Error("websocket_upgrade_timeout")));
		request.once("upgrade", (_response, socket, head) => resolve(createClient(socket, head)));
		request.once("response", response => reject(new Error(`websocket_upgrade_rejected:${response.statusCode}`)));
		request.once("error", reject);
		request.end();
	});
}

function upgradeHeaders(options) {
	return {
		Connection: "Upgrade",
		"Sec-WebSocket-Key": crypto.randomBytes(16).toString("base64"),
		"Sec-WebSocket-Version": "13",
		Upgrade: "websocket",
		...(options.headers || {})
	};
}

function createClient(socket, initialBuffer) {
	let buffer = initialBuffer || Buffer.alloc(0);
	let fragments = [];
	const messages = [];
	const waiters = [];

	function deliver(payload) {
		let message;
		try { message = JSON.parse(payload.toString("utf8")); } catch { return; }
		const index = waiters.findIndex(waiter => waiter.predicate(message));
		if (index >= 0) waiters.splice(index, 1)[0].resolve(message);
		else messages.push(message);
	}

	function drain() {
		while (buffer.length) {
			const parsed = readFrame(buffer);
			if (!parsed) return;
			buffer = buffer.subarray(parsed.consumed);
			const { fin, opcode, payload } = parsed.frame;
			if (opcode === 0x9) {
				sendClientFrame(socket, payload, 0xA);
				continue;
			}
			if (opcode === 0x8) return socket.destroy();
			if (opcode === 0x1 && !fin) {
				fragments = [payload];
				continue;
			}
			if (opcode === 0x0 && fragments.length) {
				fragments.push(payload);
				if (fin) {
					deliver(Buffer.concat(fragments));
					fragments = [];
				}
				continue;
			}
			if (opcode === 0x1) deliver(payload);
		}
	}

	socket.on("data", chunk => {
		buffer = Buffer.concat([buffer, chunk]);
		drain();
	});
	socket.once("close", () => rejectWaiters(waiters, new Error("websocket_closed")));
	socket.once("error", error => rejectWaiters(waiters, error));

	return {
		messages,
		socket,
		close: () => socket.destroy(),
		send: value => socket.write(makeClientFrame(JSON.stringify(value))),
		waitFor: (predicate, timeoutMs = 5000) => waitForMessage(messages, waiters, drain, predicate, timeoutMs),
		sendAndWait(value, predicate = message => message.id === value.id, timeoutMs = 5000) {
			const response = waitForMessage(messages, waiters, drain, predicate, timeoutMs);
			socket.write(makeClientFrame(JSON.stringify(value)));
			return response;
		}
	};
}

function waitForMessage(messages, waiters, drain, predicate, timeoutMs) {
	const queued = messages.findIndex(predicate);
	if (queued >= 0) return Promise.resolve(messages.splice(queued, 1)[0]);
	return new Promise((resolve, reject) => {
		const waiter = { predicate, resolve: settle, reject };
		const timer = setTimeout(() => {
			const index = waiters.indexOf(waiter);
			if (index >= 0) waiters.splice(index, 1);
			reject(new Error("websocket_response_timeout"));
		}, timeoutMs);
		function settle(message) {
			clearTimeout(timer);
			resolve(message);
		}
		waiters.push(waiter);
		drain();
	});
}

function rejectWaiters(waiters, error) {
	while (waiters.length) waiters.shift().reject(error);
}

module.exports = { connectRawWebSocket };
