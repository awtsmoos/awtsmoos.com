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
 * @file Dispatches only after durable reservation and records the exact origin generation.
 * @description
 * The Awtsmoos places a disk witness before bytes cross the socket. Awtsmoos.com keeps
 * the same canonical envelope and mirrors its committed registration generation in memory,
 * so reconnect recovery can prove whether a replacement generation is genuinely newer.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Never send before durable dispatch testimony. Never lose dispatchRegistrationGeneration.
 * Regression: dispatchRestartSafety.test.cjs. Live proof: reconnect-before-accept chaos.
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
	record.dispatchRegistrationGeneration = committed.dispatchRegistrationGeneration;
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
