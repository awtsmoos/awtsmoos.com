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
 * @file Bounds one accepted request without sacrificing a healthy transport generation.
 * @description
 * The Awtsmoos sustains the whole while one vessel may wait, stall, or fail its deed;
 * Awtsmoos.com therefore ends only the uncertain request, never a living socket whose
 * heartbeat and other requests still testify that connection itself remains alive.
 */
function arm(context, client, id, record, delayMs = DEFAULT_CONSUMER_PROGRESS_MS) {
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	if (!supportsStrictConsumerProgress(client) || record.consumerStartedAt) return false;
	const delay = bounded(delayMs);
	record.consumerTimer = setTimeout(() => {
		void expire(context, client, id, record);
	}, delay);
	record.consumerTimer.unref?.();
	record.consumerWatchdogMs = delay;
	return true;
}

/**
 * Resolves an expired consumer-start lease at request scope only.
 * @returns {Promise<boolean>} True only when this exact pending record was terminalized.
 */
async function expire(context, client, id, record) {
	if (context.pendingTunnelRequests.get(id) !== record || record.consumerStartedAt) {
		return false;
	}
	record.consumerTimer = null;
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
		return false;
	}
	Activity.transition(context, record, "action.consumer_stalled", {
		state: "failed",
		severity: "error",
		summary: `${record.activityContext?.action || "action"} accepted but not consumed`,
		phase: "device_consumer_progress_timeout"
	});
	return await finish(context, id, record, "device_consumer_progress_timeout", client);
}

function armForEvidence(context, client, id, record, evidence = {}) {
	if (record.consumerStartedAt || evidence.consumerStarted === true || evidence.queued !== true) {
		return false;
	}
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

/** Persists terminal consumer failure and releases the device's exact durable receipt. */
async function finish(context, id, record, reason, client = null) {
	const settled = await Lifecycle.finishPending(
		context,
		id,
		record,
		Envelopes.consumerStallEnvelope(record.expected, reason)
	);
	if (settled && client) {
		ResponseHandler.acknowledge(client, { transportReceiptId: id }, id);
	}
	return settled;
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
	expire,
	finish,
	supportsStrictConsumerProgress
};
