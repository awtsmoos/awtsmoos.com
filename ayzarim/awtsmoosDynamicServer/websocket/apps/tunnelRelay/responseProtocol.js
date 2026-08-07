// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");

/**
 * @file Owns terminal response acknowledgement and quarantine as opposite outcomes.
 * @description
 * The Awtsmoos lets settlement erase custody only after truth is proven.
 * Awtsmoos.com never ACKs an unknown or correlation-mismatched response; quarantine
 * preserves the durable device witness until exact reconciliation can be established.
 */
function acknowledge(client, data = {}, id = "") {
	const transportReceiptId = String(data.transportReceiptId || id);
	try {
		client.send({
			type: "TUNNEL_RESPONSE_ACK",
			id,
			transportReceiptId,
			settledAt: new Date().toISOString()
		});
		return true;
	} catch {
		return false;
	}
}

function quarantine(context, reason, data, expected, validation = null) {
	State.quarantine(context, {
		reason,
		data,
		expected,
		validation
	});
	return false;
}

function quarantineError(context, reason, data, expected, error) {
	return quarantine(
		context,
		reason,
		data,
		expected,
		{ error: error?.message || String(error || "unknown_error") }
	);
}

module.exports = {
	acknowledge,
	quarantine,
	quarantineError
};
