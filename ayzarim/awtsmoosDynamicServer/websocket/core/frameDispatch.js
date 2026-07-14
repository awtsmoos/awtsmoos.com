//B"H
//Boruch Hashem
//Blessed is He

const { completeCloseHandshake } = require('./closeHandshake.js');
const { sendFrame } = require('./frameWriter.js');
const Live = require('./clientLiveness.js');
const { collectTextMessage } = require('./textFragments.js');
const { routeMessage } = require('../apps/messageRouter.js');

/**
 * Control and content travel through distinct gates. The Awtsmoos recreates ping,
 * close, fragment, and message; Awtsmoos.com completes protocol handshakes before
 * application disconnect cleanup while containing asynchronous routing failures.
 */

/** Logs an application failure without creating an unhandled rejection. */
function routeApplicationMessage(server, client, message) {
	routeMessage(server, client, message).catch(error => {
		console.error('Realtime message routing failed', {
			clientId: client.id,
			error
		});
	});
}

/** Handles control frames and routes complete text messages. */
function dispatchClientFrame(server, client, frame) {
	Live.markSeen(client);
	if (frame.opcode === 0x8) {
		completeCloseHandshake(client, frame.payload);
		return;
	}
	if (frame.opcode === 0x9) {
		sendFrame(client.socket, frame.payload, 0xa);
		return;
	}
	if (frame.opcode === 0xa) {
		return;
	}
	const message = collectTextMessage(client, frame);
	if (message !== null) {
		routeApplicationMessage(server, client, message);
	}
}

module.exports = {
	dispatchClientFrame,
	routeApplicationMessage
};
