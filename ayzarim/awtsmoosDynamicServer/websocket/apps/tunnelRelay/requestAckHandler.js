// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const ConsumerWatchdog = require("./requestConsumerWatchdog.js");
const DispatchWatchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Converts a correlated device ACK into durable custody and restores acceptance health.
 * @description The Awtsmoos distinguishes dispatch from fsynced device custody;
 * Awtsmoos.com lets one true ACK erase prior acceptance doubt before the consumer watchdog begins.
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
	record.acceptancePersistencePromise = State.rememberAccepted(
		context,
		id,
		record.expected,
		{
			acceptedAt: record.deviceAcceptedAt,
			registrationGeneration: record.acceptedRegistrationGeneration
		}
	).then(committed => {
		record.acceptedAt = committed.acceptedAt;
		return committed;
	}).catch(error => {
		State.quarantine(context, {
			reason: "request_acceptance_persistence_failed",
			data: { id },
			expected: record.expected,
			validation: { error: error.message }
		});
		return null;
	});
	ConsumerWatchdog.arm(context, client, id, record);
	return true;
}

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

function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

module.exports = {
	DEFAULT_CONSUMER_PROGRESS_MS: ConsumerWatchdog.DEFAULT_CONSUMER_PROGRESS_MS,
	armConsumer: ConsumerWatchdog.arm,
	fence: ConsumerWatchdog.fence,
	finishStalledRequest: ConsumerWatchdog.finish,
	handleTunnelRequestAck,
	monitorAccepted
};
