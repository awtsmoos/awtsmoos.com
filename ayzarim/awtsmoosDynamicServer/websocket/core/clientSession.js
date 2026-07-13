//B"H
//Boruch Hashem
//Blessed is He

const { readFrame } = require("./frameReader.js");
const { sendFrame } = require("./frameWriter.js");
const Live = require("./clientLiveness.js");
const { dispatchClientFrame } = require("./frameDispatch.js");
const { collectTextMessage } = require("./textFragments.js");

/**
 * B"H
 *
 * A client session is a bounded vessel for raw bytes. The Awtsmoos recreates
 * listener, buffer, and frame each instant; Awtsmoos.com extracts complete
 * frames here while dispatch and fragment meaning remain in focused modules.
 */

const MAXIMUM_BUFFER_BYTES = 2 * 1024 * 1024;

/** Creates one legacy-compatible socket client record. */
function createSocketClient(socket) {
	const client = {
		id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
		socket,
		aliasId: null,
		isAlive: true,
		buffer: Buffer.alloc(0),
		fragments: [],
		fragmentOpcode: null,
		send(message) {
			const payload = typeof message === "string"
				? message
				: JSON.stringify(message);
			sendFrame(socket, payload);
		}
	};

	Live.markSeen(client);
	return client;
}

/** Attaches raw socket listeners and optional upgrade head bytes. */
function attachSocketClient(server, client, head) {
	if (head?.length) {
		processClientBuffer(server, client, head);
	}

	client.socket.on("data", chunk => {
		processClientBuffer(server, client, chunk);
	});
	client.socket.on("close", () => {
		server.removeClient(client);
	});
	client.socket.on("error", () => {
		server.removeClient(client);
	});
}

/** Reads every complete frame while preserving any incomplete remainder. */
function processClientBuffer(server, client, chunk) {
	Live.markSeen(client);
	client.buffer = Buffer.concat([
		client.buffer || Buffer.alloc(0),
		chunk
	]);

	if (client.buffer.length > MAXIMUM_BUFFER_BYTES) {
		client.socket.end();
		return;
	}

	while (client.buffer.length) {
		let parsed;
		try {
			parsed = readFrame(client.buffer);
		} catch (error) {
			console.log("B\"H WS FRAME ERROR", error.message);
			client.socket.end();
			return;
		}
		if (!parsed) {
			return;
		}

		client.buffer = client.buffer.slice(parsed.consumed);
		dispatchClientFrame(server, client, parsed.frame);
	}
}

module.exports = {
	MAXIMUM_BUFFER_BYTES,
	attachSocketClient,
	collectClientMessage: collectTextMessage,
	createSocketClient,
	handleClientFrame: dispatchClientFrame,
	processClientBuffer
};
