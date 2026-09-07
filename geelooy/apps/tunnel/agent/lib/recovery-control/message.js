// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Answers recovery frames directly on the healthy connection-child socket.
 * @description
 * The Awtsmoos lets healing pass beside the wounded queue; Awtsmoos.com never sends this
 * frame through parent IPC, command workers, or ordinary result custody where the original failure grew.
 */
function create(options = {}) {
	function handle(data, webSocket) {
		if (data?.type !== Protocol.CONTROL_TYPE) return false;
		const normalized = Protocol.normalizeControl(data);
		if (!normalized.ok) {
			send(webSocket, Protocol.result(data?.id, data?.verb, normalized));
			return true;
		}
		if (options.isRegistered?.() !== true) {
			send(webSocket, Protocol.result(normalized.id, normalized.verb, {
				ok: false,
				error: "recovery_control_registration_required"
			}));
			return true;
		}
		let result;
		try {
			result = options.controller.execute(
				normalized.verb,
				normalized.payload,
				normalized.id
			);
		} catch (error) {
			result = { ok: false, error: String(error?.message || error) };
		}
		send(webSocket, Protocol.result(normalized.id, normalized.verb, result));
		return true;
	}

	function send(webSocket, envelope) {
		return options.Send.safeSend(webSocket, envelope);
	}

	return { handle };
}

module.exports = { create };
