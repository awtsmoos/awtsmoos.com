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
 * @file Bounds missing request acceptance without destroying a healthy tunnel.
 * @description
 * The Awtsmoos sustains the road even when one receipt is late or absent;
 * Awtsmoos.com records uncertainty on that deed alone and never turns a request timer
 * into authority to sever the living socket that carries every other message.
 */
function arm(context, id, record, tunnel) {
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	record.acceptanceTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record || record.requestAcceptedAt) return;
		void acceptanceTimeout(context, id, record, tunnel);
	}, bounded(DEFAULT_REQUEST_ACCEPTANCE_MS));
	record.acceptanceTimer.unref?.();
}

async function acceptanceTimeout(context, id, record, tunnel = null) {
	const settled = await finish(
		context,
		id,
		record,
		"device_request_acceptance_timeout",
		tunnel
	);
	if (tunnel) noteFailure(tunnel, id, "device_request_acceptance_timeout");
	return settled;
}

async function finish(context, id, record, reason, tunnel = null) {
	const settled = await Lifecycle.finishPending(
		context,
		id,
		record,
		Envelopes.acceptanceStallEnvelope(record.expected, reason)
	);
	if (tunnel) ResponseHandler.acknowledge(tunnel, { transportReceiptId: id }, id);
	return settled;
}

/** Records acceptance degradation for diagnostics without mutating connection liveness. */
function noteFailure(tunnel, id, reason) {
	const count = Number(tunnel.acceptanceFailureCount || 0) + 1;
	tunnel.acceptanceFailureCount = count;
	tunnel.acceptanceHealthy = false;
	tunnel.lastAcceptanceFailureAt = Date.now();
	tunnel.lastAcceptanceFailureId = String(id || "");
	tunnel.lastAcceptanceFailureReason = String(reason || "acceptance_timeout");
	return count;
}

function noteSuccess(tunnel) {
	if (!tunnel) return false;
	tunnel.acceptanceFailureCount = 0;
	tunnel.acceptanceHealthy = true;
	tunnel.lastAcceptanceSuccessAt = Date.now();
	tunnel.lastAcceptanceFailureId = "";
	tunnel.lastAcceptanceFailureReason = "";
	return true;
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
	finish,
	noteFailure,
	noteSuccess
};
