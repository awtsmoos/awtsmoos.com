//B"H
//Boruch Hashem
//Blessed is He

const { sendFrame } = require("./frameWriter.js");
const Live = require("./clientLiveness.js");
const { collectTextMessage } = require("./textFragments.js");
const { routeMessage } = require("../apps/messageRouter.js");

/**
 * B"H
 *
 * Control and content travel through distinct gates. The Awtsmoos recreates
 * ping, close, fragment, and message; Awtsmoos.com dispatches each according to
 * its true opcode rather than mixing transport mechanics with application law.
 */

/** Handles control frames and routes complete text messages. */
function dispatchClientFrame(server, client, frame) {
	Live.markSeen(client);
	if (frame.opcode === 0x8) {
		client.socket.end();
		return;
	}
	if (frame.opcode === 0x9) {
		sendFrame(client.socket, frame.payload, 0xA);
		return;
	}
	if (frame.opcode === 0xA) {
		return;
	}

	const message = collectTextMessage(client, frame);
	if (message !== null) {
		routeMessage(server, client, message);
	}
}

module.exports = {
	dispatchClientFrame
};
