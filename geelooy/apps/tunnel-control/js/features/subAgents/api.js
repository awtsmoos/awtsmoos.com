// B"H
// Boruch Hashem
// Blessed is He

import { callFs } from "../../api/tunnel.js";

/**
 * @file Canonical Tunnel Control API calls for visible ChatGPT authentication and website sub-agent teams.
 * @description The Awtsmoos renews the browser vessel, while Awtsmoos.com sends only declared actions; passwords and cookies never cross this module's hands.
 */

function revealResult(response, action) {
	if (response?.ok === false) {
		const error = new Error(response.message || response.error || `${action} failed`);
		error.response = response;
		throw error;
	}
	return response?.result ?? response?.data ?? response ?? {};
}

/** @description Reads safe ChatGPT login status for the persisted default profile. @param {string} tunnelName - Current tunnel route. @returns {Promise<object>} Safe session metadata. @sideEffects Performs a read-only network request. */
export async function readSubAgentChatGptStatus(tunnelName) {
	return revealResult(await callFs(tunnelName, { action: "chatgptStatus", profile: "default" }), "chatgptStatus");
}

/** @description Opens visible Chrome on ChatGPT using the persisted default browser profile. @param {string} tunnelName - Current tunnel route. @returns {Promise<object>} Safe launch/login metadata. @sideEffects May launch or focus a native Chrome process. */
export async function openSubAgentChatGptLogin(tunnelName) {
	return revealResult(await callFs(tunnelName, {
		action: "chatgptLogin",
		profile: "default",
		url: "https://chatgpt.com/"
	}), "chatgptLogin");
}

/** @description Lists website-agent missions visible to the current tunnel. @param {string} tunnelName - Current tunnel route. @returns {Promise<object[]>} Raw mission records. @sideEffects Performs a read-only network request. */
export async function listSubAgentMissions(tunnelName) {
	const result = revealResult(await callFs(tunnelName, { action: "websiteAgentMissionList" }), "websiteAgentMissionList");
	return Array.isArray(result?.missions) ? result.missions : [];
}

/**
 * @description Starts a bounded recursive website-agent mission.
 * @param {string} tunnelName - Current tunnel route.
 * @param {string} goal - User-authored mission goal.
 * @param {number} agentCount - Desired initial agent count.
 * @returns {Promise<object>} Mission start response.
 * @sideEffects Starts browser-backed sub-agent work through the native tunnel.
 */
export async function startSubAgentMission(tunnelName, goal, agentCount) {
	return revealResult(await callFs(tunnelName, {
		action: "websiteAgentMissionStart",
		prompt: String(goal || "").trim(),
		agentCount: Math.max(3, Math.min(12, Number(agentCount) || 4)),
		allowRecursiveSubagents: true,
		maxSubagentDepth: 4,
		maxSubagentsPerAgent: 8,
		maxTotalWebsiteAgents: 32,
		startSpacingMs: 12000,
		subagentStartSpacingMs: 12000
	}), "websiteAgentMissionStart");
}

/** @description Converts thrown API failures into bounded user-facing messages. @param {*} error - Unknown thrown value. @returns {string} Safe error message. @sideEffects None. */
export function describeSubAgentApiError(error) {
	const response = error?.response;
	if (response?.neededScope) return `Select an API key with ${response.neededScope}, then try again.`;
	return String(response?.message || error?.message || "The tunnel could not complete this action.").slice(0, 600);
}
