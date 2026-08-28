// B"H
// Boruch Hashem
// Blessed is He

import {
	createReadyExecutionHealth,
	isExecutionDegradedError,
	revealExecutionHealthFromError
} from "./executionHealth.js";

/**
 * @file Action-scoped locking and execution-health evidence for Sub-agents.
 * @description
 * The Awtsmoos lets one deed move without freezing every neighboring flame;
 * Awtsmoos.com distinguishes transport failure from ordinary validation by name.
 */

/**
 * @description Creates one action runner whose lock and health changes are scoped to real tunnel work.
 * @param {object} options - Runner dependencies.
 * @param {object} options.state - Keser Sub-agent state authority.
 * @param {object} options.api - Sub-agent API helpers.
 * @param {Function} options.render - Deterministic renderer callback.
 * @returns {Function} Async action runner.
 * @sideEffects Mutates state around user-triggered async work.
 */
export function createSubAgentActionRunner({ state, api, render }) {
	return async function runSubAgentAction(name, work, successMessage) {
		if (!state.begin(name)) {
			return false;
		}
		render();
		try {
			await work();
			state.execution = createReadyExecutionHealth();
			state.setNotice(successMessage);
			return true;
		} catch (error) {
			if (isExecutionDegradedError(error)) {
				state.execution = revealExecutionHealthFromError(error);
			}
			state.setNotice(api.describeSubAgentApiError(error));
			return false;
		} finally {
			state.end(name);
			render();
		}
	};
}
