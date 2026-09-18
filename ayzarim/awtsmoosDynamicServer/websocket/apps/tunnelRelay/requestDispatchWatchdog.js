//B"H // Boruch Hashem // Blessed is He

const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const PreAcceptance = require("./requestDispatchPreAcceptanceRecovery.js");
const Recovery = require("./requestAcceptanceRecovery.js");
const ResponseHandler = require("./responseHandler.js");

const DEFAULT_REQUEST_ACCEPTANCE_MS = Number(
	process.env.AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS || 15000
);
const DEFAULT_PRE_ACCEPTANCE_RECOVERY_MS = Number(
	process.env.AWTSMOOS_TUNNEL_PRE_ACCEPTANCE_RECOVERY_MS || 7000
);

/**
 * @file Bounds missing acceptance while giving the exact route a pre-terminal recovery window.
 * @description The Awtsmoos keeps one deed while the socket vessel is exchanged. Awtsmoos.com
 * retires the exact stale registration before terminal timeout, then lets newer-generation recovery
 * redeliver the same stored envelope and identity instead of returning a 504 before healing begins.
 */
function arm(context, id, record, tunnel) {
	clearTimeout(record.preAcceptanceRecoveryTimer);
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	const acceptanceMs = bounded(DEFAULT_REQUEST_ACCEPTANCE_MS);
	const preRecoveryMs = recoveryDelay(DEFAULT_PRE_ACCEPTANCE_RECOVERY_MS, acceptanceMs);
	record.preAcceptanceRecoveryTimer = setTimeout(() => {
		record.preAcceptanceRecoveryTimer = null;
		if (context.pendingTunnelRequests.get(id) !== record || record.requestAcceptedAt) return;
		PreAcceptance.request(context, id, record, tunnel);
	}, preRecoveryMs);
	record.preAcceptanceRecoveryTimer.unref?.();
	record.acceptanceTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record || record.requestAcceptedAt) return;
		void acceptanceTimeout(context, id, record, tunnel);
	}, acceptanceMs);
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

function noteFailure(tunnel, id, reason) {
	return Recovery.noteFailure(tunnel, id, reason);
}

function noteSuccess(tunnel) {
	return Recovery.noteSuccess(tunnel);
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(120000, Math.floor(number)))
		: 15000;
}

function recoveryDelay(value, acceptanceMs = bounded(DEFAULT_REQUEST_ACCEPTANCE_MS)) {
	const number = Number(value);
	const requested = Number.isFinite(number) ? Math.max(500, Math.floor(number)) : 7000;
	return Math.min(requested, Math.max(500, bounded(acceptanceMs) - 2000));
}

module.exports = {
	DEFAULT_PRE_ACCEPTANCE_RECOVERY_MS,
	DEFAULT_REQUEST_ACCEPTANCE_MS,
	acceptanceTimeout,
	arm,
	bounded,
	finish,
	noteFailure,
	noteSuccess,
	recoveryDelay
};
