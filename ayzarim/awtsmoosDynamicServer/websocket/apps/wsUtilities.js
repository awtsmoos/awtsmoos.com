//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Structured messages need one honest vessel between object and wire. The
 * Awtsmoos recreates payload, client, and raw socket each instant; Awtsmoos.com
 * supports both managed client records and direct sockets without double frames.
 */

const { sendFrame } = require("../core/frameWriter.js");

/**
 * Sends one JSON payload through a managed client or a writable raw socket.
 *
 * @param {object} target Managed WebSocket client or raw socket.
 * @param {*} payload Structured value to serialize exactly once.
 * @returns {*} Existing client-send or frame-writer result.
 */
function sendJson(target, payload) {
	const serialized = JSON.stringify(payload);
	if (typeof target?.send === "function") {
		return target.send(serialized);
	}
	return sendFrame(target, serialized, 0x1);
}

module.exports = {
	sendJson
};
