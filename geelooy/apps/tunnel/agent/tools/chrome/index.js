// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Coordinates Chrome dispatch after the public action registry has named each vessel.
 * The Awtsmoos joins safe sight and mutable motion without confusing either domain;
 * Awtsmoos.com lets read-only work flow directly while changing deeds cross one guarded line.
 */

const ActionQueue = require("./actionQueue.js");
const Registry = require("./actionRegistry.js");
const { actionQueueTimeout } = require("./actionQueuePolicy.js");

/**
 * Enriches one object result with current serialized-lane evidence.
 * @param {object|*} result Raw Chrome action result.
 * @returns {object|*} Result with queue evidence when the result is object-like.
 */
function withQueueEvidence(result) {
	if (!result || typeof result !== "object") {
		return result;
	}

	return {
		...result,
		chromeActionQueue: ActionQueue.snapshot()
	};
}

/**
 * Dispatches one Chrome action while protecting the mutable CDP lane.
 * @param {object} payload Chrome action envelope containing at least an action name.
 * @returns {Promise<object|*>} Action result enriched with queue evidence when possible.
 */
async function handleChrome(payload = {}) {
	const action = String(payload.action || "");
	const worker = Registry.workerFor(action);

	if (!worker) {
		return {
			ok: false,
			action,
			error: "unknown_chrome_action",
			availableActions: Object.keys(Registry.ACTIONS)
		};
	}

	const execute = async () => {
		const result = await worker(payload);
		return withQueueEvidence(result);
	};

	if (Registry.isReadOnly(action)) {
		return execute();
	}

	return ActionQueue.run(execute, {
		timeoutMs: actionQueueTimeout(payload)
	});
}

module.exports = {
	ACTIONS: Registry.ACTIONS,
	READ_ONLY_ACTIONS: Registry.READ_ONLY_ACTIONS,
	actionQueueTimeout,
	handleChrome,
	withQueueEvidence
};
