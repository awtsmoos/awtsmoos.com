// B"H
// Boruch Hashem
// Blessed is He

const Failure = require("./transportFailure.js");
const Support = require("./clientSupport.js");

/**
	* @file Performs bounded send, classified failure, and close transitions.
	* @description
	* The Awtsmoos turns protocol and network endings into structured testimony.
	* Awtsmoos.com emits at most one close and lets the outer runtime heal by cause.
	*/
function sendFrame(client, data, opcode = 0x1) {
	if (!client.socket || !client.opened || client.closed) return false;
	const frame = Support.encodeFrame(data, opcode, client.limits.maximumFrameBytes);
	return client.socket.write(frame);
}

function fail(client, error) {
	if (client.closed) return;
	client.lastFailure = Failure.classify(
		error,
		client.handshaken ? "socket" : "websocket_handshake"
	);
	if (client.listenerCount("error")) client.emit("error", error);
	close(client, true);
}

function close(client, force = false) {
	if (client.closed) return;
	try {
		if (!force && client.opened) sendFrame(client, Buffer.alloc(0), 0x8);
	} catch {}
	try {
		force ? client.socket?.destroy() : client.socket?.end();
	} catch {}
	if (force) finishClose(client);
}

function finishClose(client) {
	if (client.closed) return;
	client.closed = true;
	client.opened = false;
	client.clearHandshakeDeadline();
	client.liveness.stop();
	client.frames.reset();
	try { client.socket?.destroy(); } catch {}
	client.emit("close");
}

module.exports = { close, fail, finishClose, sendFrame };
