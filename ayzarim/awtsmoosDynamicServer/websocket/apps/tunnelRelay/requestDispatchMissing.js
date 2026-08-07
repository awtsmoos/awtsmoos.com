// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Envelopes = require("./envelopes.js");
const State = require("./state.js");

/**
 * @file Finalizes a request whose chosen tunnel vanished before dispatch.
 * @description
 * The Awtsmoos gives even absence a durable witness. Awtsmoos.com records the
 * caller-visible missing-route terminal state before returning it, without creating
 * a phantom pending socket request or weakening the dispatch module around it.
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

module.exports = { missing };
