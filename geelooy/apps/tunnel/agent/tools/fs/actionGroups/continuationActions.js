// B"H

const Driver = require("../continuation/runner.js");
const Policy = require("../continuation/policy.js");
const TurnControls = require("../mission/continuationControl/actions.js");

/**
 * B"H — Short resumable continuation chunks and durable human turn controls now
 * share one public action family without confusing a one-hour lease with a pause,
 * drain, stop, or one-turn request.
 */
function buildContinuationActions(context, buildActions) {
	const { config, payload, ws } = context;
	const actions = TurnControls.build(context, buildActions);
	for (const name of Policy.ACTIONS) {
		actions[name] = async () => Driver.run(
			config,
			{ ...payload, action: name },
			ws,
			buildActions
		);
	}
	return actions;
}

module.exports = { buildContinuationActions };
