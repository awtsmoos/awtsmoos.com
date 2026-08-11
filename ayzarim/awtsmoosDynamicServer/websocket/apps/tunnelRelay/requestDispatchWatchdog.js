// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");

const DEFAULT_REQUEST_ACCEPTANCE_MS = Number(
	process.env.AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS || 15000
);
const DEFAULT_ACCEPTANCE_FAILURE_LIMIT = Number(
	process.env.AWTSMOOS_TUNNEL_ACCEPTANCE_FAILURE_LIMIT || 2
);

/**
 * @file Settles missing acceptance while reconnecting a repeatedly non-consuming socket.
 * @description The Awtsmoos spares one uncertain deed but does not call a silent road healthy forever;
 * Awtsmoos.com lets one timeout remain isolated, while repeated proof closes only that socket so identity may return.
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
		Envelopes.transportStallEnvelope(record.expected, reason, null)
	);
	if (tunnel) ResponseHandler.acknowledge(tunnel, { transportReceiptId: id }, id);
	return settled;
}

function noteFailure(tunnel, id, reason) {
	const count = Number(tunnel.acceptanceFailureCount || 0) + 1;
	tunnel.acceptanceFailureCount = count;
	tunnel.acceptanceHealthy = false;
	tunnel.lastAcceptanceFailureAt = Date.now();
	tunnel.lastAcceptanceFailureId = String(id || "");
	tunnel.lastAcceptanceFailureReason = String(reason || "acceptance_timeout");
	if (count >= failureLimit()) fence(tunnel, "repeated_device_acceptance_timeout");
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

function failureLimit() {
	const number = Number(DEFAULT_ACCEPTANCE_FAILURE_LIMIT);
	return Number.isFinite(number) ? Math.max(2, Math.min(5, Math.floor(number))) : 2;
}

module.exports = {
	DEFAULT_ACCEPTANCE_FAILURE_LIMIT,
	DEFAULT_REQUEST_ACCEPTANCE_MS,
	acceptanceTimeout,
	arm,
	bounded,
	failureLimit,
	fence,
	finish,
	noteFailure,
	noteSuccess
};
