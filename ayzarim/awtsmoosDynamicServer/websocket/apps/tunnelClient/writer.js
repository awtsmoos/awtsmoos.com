// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { sendFrame } = require("../../core/frameWriter.js");
const { CHUNK_BYTES } = require("./constants.js");
const MAX_WAIT_MS = 30000;
const FALLBACK_WAKE_MS = 500;

/**
 * @file Awtsmoos.com awaits one real drain before sending each raw byte extent.
 * The Awtsmoos keeps the first accepted byte unique;
 * a partial writer error may never summon the same payload twice.
 */
async function raw(client, buffer, options = {}) {
	if (!Buffer.isBuffer(buffer) || buffer.length > CHUNK_BYTES) {
		throw Error("INVALID_BINARY_CHUNK");
	}
	const requested = Number(options.timeoutMs);
	const budget = Number.isFinite(requested) && requested > 0
		? Math.min(MAX_WAIT_MS, requested) : MAX_WAIT_MS;
	const deadline = Date.now() + budget;
	while (Date.now() < deadline) {
		const socket = client.socket;
		if (!socket || socket.destroyed || socket.writable !== true) {
			throw Error("CLIENT_DISCONNECTED");
		}
		if (sendFrame(socket, buffer, 0x2)) return;
		if (socket.lastAwtsmoosWriteError) {
			throw Error("CLIENT_DISCONNECTED");
		}
		await waitForPressure(socket, Math.min(FALLBACK_WAKE_MS,
			Math.max(1, deadline - Date.now())));
	}
	throw Error("CLIENT_BACKPRESSURE_TIMEOUT");
}

/** Event-driven wakeup with one bounded fallback to close the missed-drain race. */
function waitForPressure(socket, timeoutMs) {
	return new Promise((resolve, reject) => {
		if (typeof socket.once !== "function") {
			reject(Error("CLIENT_DISCONNECTED"));
			return;
		}
		let timer;
		let done = false;
		const settle = error => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			socket.off("drain", onDrain);
			socket.off("close", onClosed);
			socket.off("error", onClosed);
			if (error) reject(error);
			else resolve();
		};
		const onDrain = () => settle();
		const onClosed = () => settle(Error("CLIENT_DISCONNECTED"));
		socket.once("drain", onDrain);
		socket.once("close", onClosed);
		socket.once("error", onClosed);
		timer = setTimeout(onDrain, timeoutMs);
		if (socket.destroyed || socket.writable !== true) onClosed();
	});
}

module.exports = { raw, waitForPressure };
