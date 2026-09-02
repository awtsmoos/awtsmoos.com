// B"H
// Boruch Hashem
// Blessed is He

const { completeCloseHandshake } = require("./closeHandshake.js");
const { sendFrame } = require("./frameWriter.js");
const Live = require("./clientLiveness.js");
const { collectTextMessage } = require("./textFragments.js");
const { routeMessage } = require("../apps/messageRouter.js");

/**
 * @file Routes frames only while the connection remains inside its living liveness covenant.
 * @description
 * The Awtsmoos renews ping, close, fragment, and message through measured vessels;
 * Awtsmoos.com therefore lets a terminal client finish only its CLOSE handshake. No late
 * ping, pong, fragment, or application message may animate a socket whose fence has closed.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING frameDispatchTerminalFence.test.cjs
 * Historical risk: markSeen refused to resurrect a fenced client, but frame dispatch still
 * continued into application routing. Terminal liveness must also be an execution fence.
 */
function routeApplicationMessage(server, client, message) {
	routeMessage(server, client, message).catch(error => {
		console.error("Realtime message routing failed", {
			clientId: client.id,
			error
		});
	});
}

/** Rejects every post-fence frame except CLOSE, which may complete protocol shutdown. */
function rejectTerminalFrame(client, frame) {
	if (!Live.isTerminal(client)) return false;
	if (frame.opcode === 0x8) {
		completeCloseHandshake(client, frame.payload);
		return true;
	}
	try {
		client.socket?.destroy?.();
	} catch {}
	return true;
}

/** Handles control frames and routes complete text messages only on a living connection. */
function dispatchClientFrame(server, client, frame) {
	if (rejectTerminalFrame(client, frame)) return;
	Live.markSeen(client);
	if (frame.opcode === 0x8) {
		completeCloseHandshake(client, frame.payload);
		return;
	}
	if (frame.opcode === 0x9) {
		sendFrame(client.socket, frame.payload, 0xa);
		return;
	}
	if (frame.opcode === 0xa) return;
	const message = collectTextMessage(client, frame);
	if (message !== null) routeApplicationMessage(server, client, message);
}

module.exports = {
	dispatchClientFrame,
	rejectTerminalFrame,
	routeApplicationMessage
};
