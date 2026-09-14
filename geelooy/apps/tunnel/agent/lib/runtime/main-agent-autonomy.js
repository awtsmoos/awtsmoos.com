//B"H
//Boruch Hashem
//Blessed be He

const Actions = require("../../tools/fs/actions.js");
const Autonomy = require("../../tools/fs/mission/agentAutonomy.js");

/**
 * @file Starts global disposable-Shliach maintenance beside the parent Tunnel runtime.
 * @description
 * The adapter reuses the canonical filesystem action table without entering a foreground
 * mission lock. Recovery and pool decisions therefore remain parent-resident while their
 * concrete mutations still flow through the same action implementations used everywhere else.
 */

/**
 * Executes one already-normalized local autonomy action through the canonical action table.
 *
 * @param {object} config Active Tunnel configuration and physical project-root authority.
 * @param {object} payload Action payload containing the exact global dispatcher action name.
 * @returns {Promise<object>|object} Result returned by the canonical action implementation.
 * @throws {Error} When the requested action is not exposed by the current runtime.
 */
function runAction(config, payload = {}) {
	const actions = Actions.buildActions(config, payload, null);
	const action = actions[payload.action];
	if (typeof action !== "function") {
		const error = new Error(`agent_autonomy_action_missing:${payload.action || "unknown"}`);
		error.code = "AGENT_AUTONOMY_ACTION_MISSING";
		throw error;
	}
	return action();
}

/**
 * Starts one bounded parent autonomy scheduler and converts startup failure into telemetry.
 *
 * @param {object} config Active Tunnel configuration.
 * @param {Function} log Parent logger accepting level and message.
 * @returns {object} Public scheduler state suitable for startup receipts and operator status.
 */
function start(config, log = () => undefined) {
	try {
		return Autonomy.start(config, {
			runAction: payload => runAction(config, payload)
		});
	} catch (error) {
		log(
			"warn",
			`B"H autonomous Shliach startup failed: ${error.message}`
		);
		return {
			ok: false,
			running: false,
			error: error.code || error.message
		};
	}
}

module.exports = {
	runAction,
	start
};
