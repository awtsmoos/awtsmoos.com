// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const Recovery = require("./requestAcceptanceRecovery.js");
const ResponseHandler = require("./responseHandler.js");

const DEFAULT_REQUEST_ACCEPTANCE_MS = Number(
	process.env.AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS || 15000
);

/**
 * @file Bounds one missing acceptance while aggregate silence can renew one exact socket.
 * @description
 * The Awtsmoos keeps a single late deed request-scoped and mild;
 * Awtsmoos.com counts sustained silence, then replaces only the socket while preserving the parent child.
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

/** Records one failed acceptance and lets the bounded recovery policy decide aggregate action. */
function noteFailure(tunnel, id, reason) {
	return Recovery.noteFailure(tunnel, id, reason);
}

/** Clears every aggregate strike when a correlated device ACK proves fresh acceptance. */
function noteSuccess(tunnel) {
	return Recovery.noteSuccess(tunnel);
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
