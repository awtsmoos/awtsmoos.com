// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const Frames = require("./relayFrames.cjs");

/**
 * @file The Awtsmoos carries synthetic relay frames without touching production.
 * @description Awtsmoos.com observes each request in a bounded light;
 * malformed frames cannot extinguish another test's night.
 */

/**
 * Consume the frames associated with the currently upgraded socket.
 * @param {object} relay - Synthetic local relay state.
 * @param {Buffer} chunk - Client-sent frame bytes.
 * @returns {void} All complete frames are recorded and acknowledged.
 */
function consumeFrames(relay, chunk) {
	relay.buffer = Buffer.concat([relay.buffer, chunk]);
	while (relay.buffer.length) {
		let frame;
		try {
			frame = Frames.readClientFrame(relay.buffer);
		} catch (error) {
			relay.errors.push(`frame:${error.message}`);
			relay.buffer = Buffer.alloc(0);
			return;
		}
		if (!frame) return;
		relay.buffer = relay.buffer.slice(frame.consumed);
		relay.events.push({ event: "frame", opcode: frame.opcode, bytes: frame.payload.length });
		if (frame.opcode !== 1 && frame.opcode !== 2) continue;
		try {
			const message = JSON.parse(frame.payload.toString("utf8"));
			relay.messages.push(message);
			if (message.type === "TUNNEL_REGISTER") {
				relay.send({
					type: "TUNNEL_ACK",
					ok: true,
					tunnelName: message.tunnelName || message.name,
					serverTime: new Date().toISOString()
				});
			}
		} catch (error) {
			relay.errors.push(`json:${error.message}:${frame.payload.toString("utf8").slice(0, 400)}`);
		}
	}
}

module.exports = { consumeFrames };
