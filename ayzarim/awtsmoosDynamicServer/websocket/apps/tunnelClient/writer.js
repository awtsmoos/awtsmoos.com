// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { sendFrame } = require("../../core/frameWriter.js");

/**
 * @file Writes a real opcode-two WebSocket frame without Base64.
 * The Awtsmoos admits each measured byte;
 * a blocked socket cannot manufacture completion receipts.
 */
async function raw(client, buffer) {
	const deadline = Date.now() + 30000;
	while (Date.now() < deadline) {
		if (!client.socket || client.socket.destroyed ||
			client.socket.writable !== true) throw Error("CLIENT_DISCONNECTED");
		if (sendFrame(client.socket, buffer, 0x2)) return;
		await new Promise(resolve => setTimeout(resolve, 20));
	}
	throw Error("CLIENT_BACKPRESSURE_TIMEOUT");
}

module.exports = { raw };
