// B"H
// Boruch Hashem
// Blessed is He

import { normalizeSubAgentAuth } from "./authShape.js";
import { normalizeSubAgentMissions } from "./missionShape.js";
import {
	createReadyExecutionHealth,
	isExecutionDegradedError,
	revealExecutionHealthFromError
} from "./executionHealth.js";

/**
 * @file Partial-evidence refresh authority for the Sub-agents constellation.
 * @description
 * The Awtsmoos renews each channel without requiring its neighbor to succeed;
 * Awtsmoos.com keeps auth and mission evidence independent so one failed branch cannot make all knowledge recede.
 */

/** @description Extracts a fulfilled settled result. @param {PromiseSettledResult<*>} result - Settled result. @returns {*} Fulfilled value or null. @sideEffects None. */
function fulfilledValue(result) {
	return result?.status === "fulfilled" ? result.value : null;
}

/** @description Collects rejection reasons from settled refresh branches. @param {PromiseSettledResult<*>[]} results - Settled results. @returns {*[]} Rejection reasons. @sideEffects None. */
function rejectionReasons(results) {
	return results
		.filter((result) => result?.status === "rejected")
		.map((result) => result.reason);
}

/**
 * @description Derives execution health from successful receipts and explicit transport degradation.
 * @param {PromiseSettledResult<*>[]} results - Settled authentication and mission-list reads.
 * @returns {object} Ready, degraded, or unknown execution-health record.
 * @sideEffects None.
 */
function revealRefreshExecutionHealth(results) {
	const rejections = rejectionReasons(results);
	const degraded = rejections.find(isExecutionDegradedError);
	if (degraded) {
		return revealExecutionHealthFromError(degraded);
	}
	if (results.some((result) => result?.status === "fulfilled")) {
		return createReadyExecutionHealth("The native tunnel accepted at least one live Sub-agents read.");
	}
	return revealExecutionHealthFromError(rejections[0]);
}

/**
 * @description Creates one serialized refresh that accepts auth and mission evidence independently.
 * @param {object} options - Refresh dependencies.
 * @param {object} options.state - Keser state authority.
 * @param {object} options.api - Sub-agents API implementation.
 * @param {Function} options.getTunnelName - Returns current tunnel route.
 * @param {Function} options.render - Renders the owned Sub-agents root.
 * @returns {Function} Async refresh function.
 * @sideEffects Returned function performs read-only tunnel requests and updates UI state.
 */
export function createSubAgentRefresh({ state, api, getTunnelName, render }) {
	return async function refreshSubAgentConstellation() {
		if (!state.begin("refresh")) {
			return false;
		}
		const generation = state.beginRefreshGeneration();
		render();
		try {
			const tunnelName = getTunnelName();
			const results = await Promise.allSettled([
				api.readSubAgentChatGptStatus(tunnelName),
				api.listSubAgentMissions(tunnelName)
			]);
			const authRaw = fulfilledValue(results[0]);
			const missionsRaw = fulfilledValue(results[1]);
			const next = { execution: revealRefreshExecutionHealth(results) };
			if (authRaw) {
				next.auth = normalizeSubAgentAuth(authRaw);
			}
			if (missionsRaw) {
				next.missions = normalizeSubAgentMissions(missionsRaw);
			}
			state.acceptRefresh(generation, next);
			const rejections = rejectionReasons(results);
			state.setNotice(rejections.length
				? api.describeSubAgentApiError(rejections[0])
				: "Constellation refreshed from live tunnel evidence.");
			return rejections.length === 0;
		} finally {
			state.end("refresh");
			render();
		}
	};
}
