// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const ConsumerWatchdog = require("./requestConsumerWatchdog.js");
const DispatchWatchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Converts a correlated device ACK into durable custody and request-scoped monitoring.
 * @description
 * The Awtsmoos distinguishes dispatch from fsynced device custody, one truth from the next;
 * Awtsmoos.com lets an ACK erase acceptance doubt without granting a request timer power
 * to sever the living transport that carries every other deed and every future text.
 */
function handleTunnelRequestAck(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || data.transportReceiptId || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_request_ack", data, null);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(context, "foreign_registration_request_ack", data, record.expected);
	}
	clearTimeout(record.acceptanceTimer);
	record.acceptanceTimer = null;
	record.requestAcceptedAt = Date.now();
	record.deviceAcceptedAt = data.acceptedAt || new Date().toISOString();
	record.acceptedRegistrationGeneration = client.registrationGeneration || 0;
	DispatchWatchdog.noteSuccess(client);
	record.acceptancePersistencePromise = rememberAcceptance(context, id, record);
	ConsumerWatchdog.arm(context, client, id, record);
	return true;
}

/** Re-arms request-scoped monitoring after recovery without touching socket health. */
function monitorAccepted(context, client) {
	let monitored = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (record.registrationKey !== client?.registrationKey ||
			!record.requestAcceptedAt || record.finalizationPromise) continue;
		ConsumerWatchdog.arm(context, client, id, record);
		monitored += 1;
	}
	return monitored;
}

async function rememberAcceptance(context, id, record) {
	try {
		const committed = await State.rememberAccepted(context, id, record.expected, {
			acceptedAt: record.deviceAcceptedAt,
			registrationGeneration: record.acceptedRegistrationGeneration
		});
		record.acceptedAt = committed.acceptedAt;
		return committed;
	} catch (error) {
		State.quarantine(context, {
			reason: "request_acceptance_persistence_failed",
			data: { id },
			expected: record.expected,
			validation: { error: error.message }
		});
		return null;
	}
}

function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

module.exports = {
	DEFAULT_CONSUMER_PROGRESS_MS: ConsumerWatchdog.DEFAULT_CONSUMER_PROGRESS_MS,
	armConsumer: ConsumerWatchdog.arm,
	finishStalledRequest: ConsumerWatchdog.finish,
	handleTunnelRequestAck,
	monitorAccepted
};
