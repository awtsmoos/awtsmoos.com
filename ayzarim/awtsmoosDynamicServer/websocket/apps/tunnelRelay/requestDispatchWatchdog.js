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
 * @file Fences a dispatch that never receives durable device acceptance.
 * @description
 * The Awtsmoos permits no second side effect merely because an ACK was absent.
 * Awtsmoos.com finalizes the uncertain request, acknowledges settlement, and closes
 * the suspect transport before another generation may proceed.
 */
function arm(context, id, record, tunnel) {
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	record.acceptanceTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record ||
			record.requestAcceptedAt) return;
		void finish(context, id, record, "device_request_acceptance_timeout", tunnel)
			.finally(() => fence(tunnel, "device_request_acceptance_timeout"));
	}, bounded(DEFAULT_REQUEST_ACCEPTANCE_MS));
	record.acceptanceTimer.unref?.();
}

async function finish(context, id, record, reason, tunnel = null) {
	const settled = await Lifecycle.finishPending(
		context, id, record, Envelopes.transportStallEnvelope(record.expected, reason, false)
	);
	if (tunnel) ResponseHandler.acknowledge(tunnel, { transportReceiptId: id }, id);
	return settled;
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

module.exports = { DEFAULT_REQUEST_ACCEPTANCE_MS, arm, bounded, fence, finish };
