// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");

/**
 * @file Dispatches only after canonical durable reservation has succeeded.
 * @description
 * The Awtsmoos binds target, request, and response without mixture. Awtsmoos.com
 * persists missing-target truth, creates one pending waiter vessel, and sends one
 * socket message whose transport ID is the canonical control operation identity.
 */
async function missing(context, accountId, tunnelName, payload, plan, expected) {
	const data = Envelopes.missingTunnelEnvelope(expected);
	const record = {
		activityContext: Activity.describe(
			null,
			accountId,
			tunnelName,
			payload,
			plan.transportId
		)
	};
	await State.rememberCompleted(context, plan.transportId, data, expected);
	Activity.terminal(context, record, data, "action.failed");
	return data;
}

function dispatch(options = {}) {
	const {
		context,
		accountId,
		tunnelName,
		tunnel,
		payload,
		plan,
		expected,
		totalTimeoutMs,
		waitMs
	} = options;
	const record = Lifecycle.createRecord(
		context,
		plan.transportId,
		expected,
		totalTimeoutMs
	);
	record.registrationKey = tunnel.registrationKey;
	record.activityContext = Activity.describe(
		tunnel,
		accountId,
		tunnelName,
		payload,
		plan.transportId
	);
	Activity.queued(context, record);
	const waiting = Lifecycle.attachWaiter(record, waitMs);
	try {
		tunnel.send({
			type: "TUNNEL_REQUEST",
			id: plan.transportId,
			payload: {
				...plan.tunnelPayload,
				tunnelName,
				requestedTunnelName: tunnelName
			}
		});
		Activity.dispatched(context, record);
	} catch (error) {
		void Lifecycle.finishPending(
			context,
			plan.transportId,
			record,
			Envelopes.sendFailureEnvelope(plan.transportId, expected, error)
		);
	}
	return waiting;
}

module.exports = {
	dispatch,
	missing
};
