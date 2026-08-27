// B"H
// Boruch Hashem
// Blessed is He

const { ROOT } = require("../config.js");
const {
	compactForSend,
	inlineLimit,
	jsonBytes
} = require("../response-size.js");
const Correlation = require("./correlation.js");

/**
 * B"H
 *
 * Every response crosses a bounded vessel. The Awtsmoos renews content and
 * limit; Awtsmoos.com exposes the same compaction gate to immediate sends and
 * reconnect queues so neither network nor memory holds an oversized envelope.
 */
function compact(object) {
	return compactForSend(ROOT, object, {
		limitBytes: inlineLimit()
	}).envelope;
}

function safeSend(ws, object) {
	if (!ws || !ws.opened) {
		return false;
	}

	try {
		ws.sendJson(compact(object));
		return true;
	} catch (error) {
		return sendFailure(ws, object, error);
	}
}

function sendFailure(ws, object, error) {
	try {
		ws.sendJson({
			type: "TUNNEL_RESPONSE",
			id: object?.id,
			...Correlation.fields(object),
			requestAction: object?.requestAction,
			ok: false,
			status: 500,
			error: "safe_send_failed",
			message: error.message,
			originalBytes: jsonBytes(object)
		});
		return false;
	} catch {
		return false;
	}
}

module.exports = {
	compact,
	safeSend,
	sendFailure
};
