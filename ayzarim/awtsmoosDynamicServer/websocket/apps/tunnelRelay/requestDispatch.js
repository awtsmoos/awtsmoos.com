// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Activity = require("./requestActivity.js");
const Lifecycle = require("./lifecycle.js");
const RetryRequest = require("./retryRequest.js");

/**
 * @file Dispatches a new relay request and binds its realtime lifecycle context.
 * @description
 * The Awtsmoos renews target, request, and response without losing their bond.
 * Awtsmoos.com creates one correlated action vessel before dispatch, then records
 * missing targets and send failures without revealing foreign registry details.
 */

/** Returns a failed event and disclosure-safe envelope for an absent target. */
function missing(context, accountId, tunnelName, payload, plan, expected) {
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
	Activity.terminal(context, record, data, "action.failed");
	return Promise.resolve(data);
}

/** Creates, publishes, and dispatches one new pending relay request. */
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
		waitMs,
		retry
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
	if (retry) {
		RetryRequest.decorate(record, retry);
	}
	Activity.queued(context, record);
	const waiting = Lifecycle.attachWaiter(record, waitMs);
	try {
		tunnel.send({
			type: "TUNNEL_REQUEST",
			id: plan.transportId,
			// Selection already resolved the authorized, account-scoped live name.
			// Do not let a database tunnel id or stale caller alias overwrite the
			// transport identity that the agent must echo in its response.
			payload: {
				...plan.tunnelPayload,
				tunnelName,
				requestedTunnelName: tunnelName
			}
		});
		Activity.dispatched(context, record);
	} catch (error) {
		Lifecycle.finishPending(
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
