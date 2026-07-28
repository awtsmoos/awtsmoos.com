// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const State = require("./state.js");

const DEFAULT_CONSUMER_PROGRESS_MS = Number(
	process.env.AWTSMOOS_TUNNEL_CONSUMER_PROGRESS_MS || 15000
);

/**
 * @file Converts device durability testimony into bounded consumer liveness.
 * @description
 * The Awtsmoos distinguishes a socket that received bytes from an execution
 * parent that actually consumed them. Awtsmoos.com fences a half-alive vessel
 * without completing, duplicating, or forgetting the canonical request.
 */
function handleTunnelRequestAck(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || data.transportReceiptId || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_request_ack", data, null);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(
			context,
			"foreign_registration_request_ack",
			data,
			record.expected
		);
	}
	clearTimeout(record.acceptanceTimer);
	record.acceptanceTimer = null;
	record.requestAcceptedAt = Date.now();
	record.acceptedRegistrationGeneration = client.registrationGeneration || 0;
	void State.rememberAccepted(context, id, record.expected, {
		acceptedAt: data.acceptedAt || new Date().toISOString(),
		registrationGeneration: record.acceptedRegistrationGeneration
	}).catch(error => State.quarantine(context, {
		reason: "request_acceptance_persistence_failed",
		data: { id },
		expected: record.expected,
		validation: { error: error.message }
	}));
	armConsumer(context, client, id, record);
	return true;
}

function armConsumer(context, client, id, record) {
	clearTimeout(record.consumerTimer);
	record.consumerTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record) return;
		if (Number(record.lastProgressAt || 0) >= record.requestAcceptedAt) return;
		fence(client, "device_consumer_progress_timeout");
		Activity.transition(context, record, "action.transport_stalled", {
			state: "recovering",
			severity: "error",
			summary: `${record.activityContext?.action || "action"} accepted but not consumed`,
			phase: "device_consumer_progress_timeout"
		});
	}, bounded(DEFAULT_CONSUMER_PROGRESS_MS));
	record.consumerTimer.unref?.();
}

function monitorAccepted(context, client) {
	let monitored = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (
			record.registrationKey !== client?.registrationKey ||
			!record.requestAcceptedAt ||
			record.finalizationPromise
		) {
			continue;
		}
		armConsumer(context, client, id, record);
		monitored += 1;
	}
	return monitored;
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

function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(120000, Math.floor(number)))
		: 15000;
}

module.exports = {
	DEFAULT_CONSUMER_PROGRESS_MS,
	armConsumer,
	fence,
	handleTunnelRequestAck,
	monitorAccepted
};
