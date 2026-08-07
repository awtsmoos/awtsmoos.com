// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const Missing = require("./requestDispatchMissing.js");
const Recovery = require("./requestDispatchRecovery.js");
const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Dispatches only after durable reservation and stamps origin generation.
 * @description
 * The Awtsmoos places a disk witness before bytes cross the socket. Awtsmoos.com
 * gives each request an opaque origin key so a late terminal answer can return to
 * its exact old record after reconnect without granting permission to replay it.
 */
async function dispatch(options = {}) {
	const record = createRecord(options);
	Activity.queued(options.context, record);
	const waiting = Lifecycle.attachWaiter(record, options.waitMs);
	try {
		await sendDurably(options, record);
	} catch (error) {
		void Lifecycle.finishPending(
			options.context,
			options.plan.transportId,
			record,
			Envelopes.sendFailureEnvelope(
				options.plan.transportId,
				options.expected,
				error
			)
		);
	}
	return waiting;
}

function createRecord(options) {
	const record = Lifecycle.createRecord(
		options.context,
		options.plan.transportId,
		options.expected,
		options.totalTimeoutMs
	);
	record.registrationKey = options.tunnel.registrationKey;
	record.activityContext = Activity.describe(
		options.tunnel,
		options.accountId,
		options.tunnelName,
		options.payload,
		options.plan.transportId
	);
	record.dispatchEnvelope = envelope(
		options.plan,
		options.tunnelName,
		options.tunnel.registrationKey
	);
	return record;
}

async function sendDurably(options, record) {
	const committed = await State.rememberDispatched(
		options.context,
		options.plan.transportId,
		options.expected,
		{
			dispatchedAt: new Date().toISOString(),
			registrationGeneration: options.tunnel.registrationGeneration || 0
		}
	);
	record.dispatchedAt = committed.dispatchedAt;
	record.dispatchStartedAt = Date.parse(committed.dispatchedAt);
	options.tunnel.send(record.dispatchEnvelope);
	Watchdog.arm(options.context, options.plan.transportId, record, options.tunnel);
	Activity.dispatched(options.context, record);
}

function envelope(plan, tunnelName, originRegistrationKey) {
	return {
		type: "TUNNEL_REQUEST",
		id: plan.transportId,
		payload: {
			...plan.tunnelPayload,
			tunnelName,
			requestedTunnelName: tunnelName,
			originRegistrationKey
		}
	};
}

module.exports = {
	DEFAULT_REQUEST_ACCEPTANCE_MS: Watchdog.DEFAULT_REQUEST_ACCEPTANCE_MS,
	armAcceptance: Watchdog.arm,
	createRecord,
	dispatch,
	envelope,
	fenceAfterSettlement: Watchdog.fence,
	finishStalledRequest: Watchdog.finish,
	missing: Missing.missing,
	recoverPending: Recovery.recoverPending,
	sendDurably
};
