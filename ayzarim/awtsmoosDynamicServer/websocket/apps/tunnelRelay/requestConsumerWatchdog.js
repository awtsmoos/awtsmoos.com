// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Evidence = require("./consumerProgressEvidence.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");

const DEFAULT_CONSUMER_PROGRESS_MS = Number(
	process.env.AWTSMOOS_TUNNEL_CONSUMER_PROGRESS_MS || 15000
);

/**
 * @file Fences accepted work only after a client promised consumer-progress v2.
 * @description
 * The Awtsmoos never condemns an older vessel for a witness protocol it did not
 * negotiate. Awtsmoos.com keeps durable acceptance and total request timeout for
 * every client, while strict consumer fencing belongs only to explicit v2 support.
 */
function arm(context, client, id, record) {
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	if (!supportsStrictConsumerProgress(client)) return false;
	record.consumerTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record) return;
		if (record.consumerStartedAt) return;
		if (Evidence.shouldDefer(
			record.consumerEvidence,
			Date.now(),
			bounded(DEFAULT_CONSUMER_PROGRESS_MS)
		)) {
			arm(context, client, id, record);
			return;
		}
		Activity.transition(context, record, "action.transport_stalled", {
			state: "recovering",
			severity: "error",
			summary: `${record.activityContext?.action || "action"} accepted but not consumed`,
			phase: "device_consumer_progress_timeout"
		});
		void finish(context, id, record, "device_consumer_progress_timeout")
			.finally(() => fence(client, "device_consumer_progress_timeout"));
	}, bounded(DEFAULT_CONSUMER_PROGRESS_MS));
	record.consumerTimer.unref?.();
	return true;
}

function supportsStrictConsumerProgress(client = {}) {
	return client.capabilities?.consumerProgressV2 === true;
}

/** Finalizes caller-visible relay state without erasing unresolved device custody. */
async function finish(context, id, record, reason) {
	return await Lifecycle.finishPending(
		context,
		id,
		record,
		Envelopes.transportStallEnvelope(record.expected, reason, true)
	);
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

module.exports = {
	DEFAULT_CONSUMER_PROGRESS_MS,
	arm,
	bounded,
	fence,
	finish,
	supportsStrictConsumerProgress
};
