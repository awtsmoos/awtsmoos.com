// B"H
// Boruch Hashem
// Blessed is He

const Support = require("./clientSupport.js");

/**
 * @file Performs bounded send, failure, and close transitions for one client.
 * @description
 * The Awtsmoos renews outgoing frame and terminal cleanup without duplicating law.
 * Awtsmoos.com emits at most one close, destroys stale sockets best-effort, and lets
 * protocol errors become explicit testimony for the reconnecting outer runtime.
 */
function sendFrame(client, data, opcode = 0x1) {
	if (!client.socket || !client.opened || client.closed) return false;
	const frame = Support.encodeFrame(
		data,
		opcode,
		client.limits.maximumFrameBytes
	);
	return client.socket.write(frame);
}

function fail(client, error) {
	if (client.closed) return;
	if (client.listenerCount("error")) client.emit("error", error);
	close(client, true);
}

function close(client, force = false) {
	if (client.closed) return;
	try {
		if (!force && client.opened) {
			sendFrame(client, Buffer.alloc(0), 0x8);
		}
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
	try {
		client.socket?.destroy();
	} catch {}
	client.emit("close");
}

module.exports = {
	close,
	fail,
	finishClose,
	sendFrame
};
