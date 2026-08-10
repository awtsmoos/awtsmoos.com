// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");

const DEFAULT_REQUEST_ACCEPTANCE_MS = Number(
	process.env.AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS || 15000
);

/**
 * @file Settles one missing-acceptance request without destroying a healthy tunnel.
 * @description
 * The Awtsmoos distinguishes one uncertain deed from the road that carried it.
 * Awtsmoos.com ends the exact canonical request fail-closed, while connection fencing
 * remains reserved for independently proven protocol or transport corruption.
 */
function arm(context, id, record, tunnel) {
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	record.acceptanceTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record ||
			record.requestAcceptedAt) return;
		void acceptanceTimeout(context, id, record, tunnel);
	}, bounded(DEFAULT_REQUEST_ACCEPTANCE_MS));
	record.acceptanceTimer.unref?.();
}

/** Settles only the exact request; it deliberately does not alter tunnel liveness. */
async function acceptanceTimeout(context, id, record, tunnel = null) {
	return finish(
		context,
		id,
		record,
		"device_request_acceptance_timeout",
		tunnel
	);
}

async function finish(context, id, record, reason, tunnel = null) {
	const settled = await Lifecycle.finishPending(
		context,
		id,
		record,
		Envelopes.transportStallEnvelope(record.expected, reason, null)
	);
	if (tunnel) ResponseHandler.acknowledge(tunnel, { transportReceiptId: id }, id);
	return settled;
}

/** Explicit connection fence for callers with independent corruption evidence. */
function fence(tunnel, reason) {
	if (!tunnel) return false;
	tunnel.connected = false;
	tunnel.isAlive = false;
	tunnel.lastTransportError = reason;
	try {
		if (typeof tunnel.close === "function") tunnel.close(4002, reason);
		else tunnel.socket?.end?.();
		return true;
	} catch {
		return false;
	}
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(120000, Math.floor(number)))
		: 15000;
}

module.exports = {
	DEFAULT_REQUEST_ACCEPTANCE_MS,
	acceptanceTimeout,
	arm,
	bounded,
	fence,
	finish
};
