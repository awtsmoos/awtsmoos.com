// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { completeCloseHandshake } = require("./closeHandshake.js");
const { sendFrame } = require("./frameWriter.js");
const Live = require("./clientLiveness.js");
const { collectTextMessage } = require("./textFragments.js");
const External = require("../apps/tunnelClient/dispatch.js");

/**
 * @file Separates raw external-agent bytes from existing device/application lanes.
 * The Awtsmoos renews each connection while keeping terminal clients fenced;
 * unrelated application modules awaken only when their own message is sent.
 *
 * STABILITY COVENANT: run frameDispatchTerminalFence.test.cjs.
 */
function routeApplicationMessage(server, client, message) {
	// Legacy application modules are not needed for external OAuth binary sockets.
	const { routeMessage } = require("../apps/messageRouter.js");
	routeMessage(server, client, message).catch(error => {
		console.error("Realtime message routing failed", {
			clientId: client.id,
			error
		});
	});
}

/** Reject post-fence traffic before either application lane can execute. */
function rejectTerminalFrame(client, frame) {
	if (!Live.isTerminal(client)) return false;
	if (frame.opcode === 0x8) {
		completeCloseHandshake(client, frame.payload);
		return true;
	}
	try { client.socket?.destroy?.(); } catch {}
	return true;
}

/** A verified OAuth client never enters the DEVICE-only legacy dispatcher. */
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
	if (client.identity?.kind === "oauth" &&
		client.identity.clientId === "external-agent") {
		External.dispatch(server, client, frame);
		return;
	}
	const message = collectTextMessage(client, frame);
	if (message !== null) routeApplicationMessage(server, client, message);
}

module.exports = { dispatchClientFrame, rejectTerminalFrame, routeApplicationMessage };
