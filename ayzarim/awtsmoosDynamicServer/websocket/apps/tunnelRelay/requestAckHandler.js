// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const Watchdog = require("./requestConsumerWatchdog.js");

/**
 * @file Converts a correlated device ACK into visible and durable custody truth.
 * @description
 * The Awtsmoos distinguishes socket dispatch from a device that fsynced the inbox.
 * Awtsmoos.com exposes acceptance only after this ACK and preserves its generation
 * while a separate watchdog waits for the parent execution consumer.
 */
function handleTunnelRequestAck(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || data.transportReceiptId || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_request_ack", data, null);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(
			context, "foreign_registration_request_ack", data, record.expected
		);
	}
	clearTimeout(record.acceptanceTimer);
	record.acceptanceTimer = null;
	record.requestAcceptedAt = Date.now();
	record.deviceAcceptedAt = data.acceptedAt || new Date().toISOString();
	record.acceptedRegistrationGeneration = client.registrationGeneration || 0;
	record.acceptancePersistencePromise = State.rememberAccepted(
		context, id, record.expected, {
			acceptedAt: record.deviceAcceptedAt,
			registrationGeneration: record.acceptedRegistrationGeneration
		}
	).then(committed => {
		record.acceptedAt = committed.acceptedAt;
		return committed;
	}).catch(error => {
		State.quarantine(context, {
			reason: "request_acceptance_persistence_failed",
			data: { id }, expected: record.expected,
			validation: { error: error.message }
		});
		return null;
	});
	Watchdog.arm(context, client, id, record);
	return true;
}

function monitorAccepted(context, client) {
	let monitored = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (record.registrationKey !== client?.registrationKey ||
			!record.requestAcceptedAt || record.finalizationPromise) continue;
		Watchdog.arm(context, client, id, record);
		monitored += 1;
	}
	return monitored;
}

function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

module.exports = {
	DEFAULT_CONSUMER_PROGRESS_MS: Watchdog.DEFAULT_CONSUMER_PROGRESS_MS,
	armConsumer: Watchdog.arm, fence: Watchdog.fence,
	finishStalledRequest: Watchdog.finish, handleTunnelRequestAck, monitorAccepted
};
