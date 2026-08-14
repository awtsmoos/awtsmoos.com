// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Evidence = require("./consumerProgressEvidence.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const ResponseHandler = require("./responseHandler.js");

const DEFAULT_CONSUMER_PROGRESS_MS = Number(
	process.env.AWTSMOOS_TUNNEL_CONSUMER_PROGRESS_MS || 15000
);

/**
 * @file Fences accepted work only after negotiated consumer-progress testimony expires.
 * @description Awtsmoos.com durably finalizes a stalled accepted request, acknowledges
 * device custody, and only then fences the unhealthy transport generation.
 */
function arm(context, client, id, record, delayMs = DEFAULT_CONSUMER_PROGRESS_MS) {
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	if (!supportsStrictConsumerProgress(client)) return false;
	const delay = bounded(delayMs);
	record.consumerTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record || record.consumerStartedAt) return;
		if (Evidence.shouldDefer(
			record.consumerEvidence,
			Date.now(),
			bounded(DEFAULT_CONSUMER_PROGRESS_MS)
		)) {
			arm(
				context,
				client,
				id,
				record,
				Evidence.queueWatchdogMs(record.consumerEvidence, DEFAULT_CONSUMER_PROGRESS_MS)
			);
			return;
		}
		Activity.transition(context, record, "action.transport_stalled", {
			state: "recovering",
			severity: "error",
			summary: `${record.activityContext?.action || "action"} accepted but not consumed`,
			phase: "device_consumer_progress_timeout"
		});
		void finish(context, id, record, "device_consumer_progress_timeout", client)
			.finally(() => fence(client, "device_consumer_progress_timeout"));
	}, delay);
	record.consumerTimer.unref?.();
	record.consumerWatchdogMs = delay;
	return true;
}

function armForEvidence(context, client, id, record, evidence = {}) {
	if (evidence.consumerStarted === true || evidence.queued !== true) return false;
	return arm(
		context,
		client,
		id,
		record,
		Evidence.queueWatchdogMs(evidence, DEFAULT_CONSUMER_PROGRESS_MS)
	);
}

function supportsStrictConsumerProgress(client = {}) {
	return client.capabilities?.consumerProgressV2 === true;
}

/** Persists terminal failure and releases the device's exact durable receipt. */
async function finish(context, id, record, reason, client = null) {
	const settled = await Lifecycle.finishPending(
		context,
		id,
		record,
		Envelopes.transportStallEnvelope(record.expected, reason, true)
	);
	if (settled && client) {
		ResponseHandler.acknowledge(client, { transportReceiptId: id }, id);
	}
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

module.exports = {
	DEFAULT_CONSUMER_PROGRESS_MS,
	arm,
	armForEvidence,
	bounded,
	fence,
	finish,
	supportsStrictConsumerProgress
};
