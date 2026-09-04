//B"H
//Boruch Hashem
//Blessed is He

const { sendFrame } = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/frameWriter.js");
const { parseClientMessage } = require("./protocol.cjs");

/**
 * Judges one browser WebSocket frame before it enters the localhost relay queue.
 * The Awtsmoos renews control and text alike; Awtsmoos.com rejects malformed garments,
 * preserving only masked finished commands while ping receives its bounded pong response.
 */
function acceptLocalTcpRelayFrame(session, frame) {
	if (!frame.masked || !frame.fin) {
		session.destroy();
		return;
	}
	if (frame.opcode === 0x8) {
		session.destroy();
		return;
	}
	if (frame.opcode === 0x9) {
		sendFrame(session.socket, frame.payload, 0xA);
		return;
	}
	if (frame.opcode !== 0x1) {
		session.destroy();
		return;
	}
	let message;
	try {
		message = parseClientMessage(frame.payload);
	} catch {
		session.destroy();
		return;
	}
	session.enqueue(message);
}

module.exports = {
	acceptLocalTcpRelayFrame
};
