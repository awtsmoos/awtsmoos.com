// B"H
// Boruch Hashem
// Blessed is He

import { callFs } from "../../api/tunnel.js";

/**
 * @file Canonical API calls for visible ChatGPT authentication and website sub-agent teams.
 * @description
 * The Awtsmoos renews the browser vessel while Awtsmoos.com sends only declared actions;
 * passwords, cookies, and browser tokens never enter this module's transactions.
 */

/**
 * @description Unwraps one Tunnel Control response or raises a structured safe error.
 * @param {object} response - Tunnel Control response envelope.
 * @param {string} action - Expected filesystem action name.
 * @returns {object} Unwrapped result object.
 * @throws {Error} When the response explicitly reports failure.
 * @sideEffects None.
 */
function revealResult(response, action) {
	if (response?.ok === false) {
		const error = new Error(response.message || response.error || `${action} failed`);
		error.response = response;
		throw error;
	}
	return response?.result ?? response?.data ?? response ?? {};
}

/**
 * @description Reads safe login status for the persisted default ChatGPT browser profile.
 * @param {string} tunnelName - Current tunnel route.
 * @returns {Promise<object>} Safe session metadata.
 * @throws {Error} When the filesystem action reports failure.
 * @sideEffects Performs a read-only network request.
 */
export async function readSubAgentChatGptStatus(tunnelName) {
	const response = await callFs(tunnelName, {
		action: "chatgptStatus",
		profile: "default"
	});
	return revealResult(response, "chatgptStatus");
}

/**
 * @description Opens visible ChatGPT Chrome using the persisted default native browser profile.
 * @param {string} tunnelName - Current tunnel route.
 * @returns {Promise<object>} Safe launch and login metadata.
 * @throws {Error} When browser launch or filesystem action execution fails.
 * @sideEffects May launch or focus a native Chrome process.
 */
export async function openSubAgentChatGptLogin(tunnelName) {
	const response = await callFs(tunnelName, {
		action: "chatgptLogin",
		profile: "default",
		url: "https://chatgpt.com/"
	});
	return revealResult(response, "chatgptLogin");
}

/**
 * @description Lists website-agent missions visible through the current tunnel.
 * @param {string} tunnelName - Current tunnel route.
 * @returns {Promise<object[]>} Raw mission records.
 * @throws {Error} When mission listing fails.
 * @sideEffects Performs a read-only network request.
 */
export async function listSubAgentMissions(tunnelName) {
	const response = await callFs(tunnelName, {
		action: "websiteAgentMissionList"
	});
	const result = revealResult(response, "websiteAgentMissionList");
	return Array.isArray(result?.missions) ? result.missions : [];
}

/**
 * @description Starts a bounded recursive website-agent mission.
 * @param {string} tunnelName - Current tunnel route.
 * @param {string} goal - User-authored mission goal.
 * @param {number} agentCount - Desired initial agent count.
 * @returns {Promise<object>} Mission start response.
 * @throws {Error} When browser scope or mission execution fails.
 * @sideEffects Starts browser-backed sub-agent work through the native tunnel.
 */
export async function startSubAgentMission(tunnelName, goal, agentCount) {
	const response = await callFs(tunnelName, {
		action: "websiteAgentMissionStart",
		prompt: String(goal || "").trim(),
		agentCount: Math.max(3, Math.min(12, Number(agentCount) || 4)),
		allowRecursiveSubagents: true,
		maxSubagentDepth: 4,
		maxSubagentsPerAgent: 8,
		maxTotalWebsiteAgents: 32,
		startSpacingMs: 12000,
		subagentStartSpacingMs: 12000
	});
	return revealResult(response, "websiteAgentMissionStart");
}

/**
 * @description Converts thrown API failures into bounded user-facing text without rendering secrets.
 * @param {*} error - Unknown thrown value.
 * @returns {string} Safe bounded error message.
 * @sideEffects None.
 */
export function describeSubAgentApiError(error) {
	const response = error?.response;
	if (response?.neededScope) {
		return `Select an API key with ${response.neededScope}, then try again.`;
	}
	return String(response?.message || error?.message || "The tunnel could not complete this action.").slice(0, 600);
}
