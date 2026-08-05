// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");

const DEFAULT_CONSUMER_PROGRESS_MS = Number(
	process.env.AWTSMOOS_TUNNEL_CONSUMER_PROGRESS_MS || 15000
);

/**
 * @file Fences a device that accepted custody but never showed consumer progress.
 * @description
 * The Awtsmoos distinguishes durable inbox custody from execution consumption.
 * Awtsmoos.com settles the stalled deed without replay and closes the half-alive
 * generation so the guardian may reveal a healthier vessel.
 */
function arm(context, client, id, record) {
	clearTimeout(record.consumerTimer);
	record.consumerTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record) return;
		if (Number(record.lastProgressAt || 0) >= record.requestAcceptedAt) return;
		Activity.transition(context, record, "action.transport_stalled", {
			state: "recovering",
			severity: "error",
			summary: `${record.activityContext?.action || "action"} accepted but not consumed`,
			phase: "device_consumer_progress_timeout"
		});
		void finish(context, id, record, "device_consumer_progress_timeout", client)
			.finally(() => fence(client, "device_consumer_progress_timeout"));
	}, bounded(DEFAULT_CONSUMER_PROGRESS_MS));
	record.consumerTimer.unref?.();
}

async function finish(context, id, record, reason, client = null) {
	const settled = await Lifecycle.finishPending(
		context, id, record, Envelopes.transportStallEnvelope(record.expected, reason, true)
	);
	if (client) ResponseHandler.acknowledge(client, { transportReceiptId: id }, id);
	return settled;
}

function fence(client, reason) {
	if (!client) return false;
	client.connected = false;
	client.isAlive = false;
	client.lastTransportError = reason;
	try {
		if (typeof client.close === "function") client.close(4002, reason);
		else client.socket?.end?.();
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

module.exports = { DEFAULT_CONSUMER_PROGRESS_MS, arm, bounded, fence, finish };
