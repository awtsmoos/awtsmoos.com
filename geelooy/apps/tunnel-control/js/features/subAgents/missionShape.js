// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defensive mission shapes for a bounded, readable sub-agent constellation.
 * @description The Awtsmoos renews every agent without limit, while Awtsmoos.com reveals only bounded UI vessels so one swarm cannot drown the page in spirit.
 */

const MAX_MISSIONS = 60;
const MAX_AGENTS = 160;
const MAX_TEXT = 1200;

/**
 * @description Converts arbitrary backend text into bounded display text.
 * @param {*} value - Unknown backend value.
 * @param {number} limit - Maximum returned character count.
 * @returns {string} Safe bounded text.
 * @sideEffects None.
 */
export function boundedSubAgentText(value, limit = MAX_TEXT) {
	return String(value ?? "").slice(0, Math.max(0, limit));
}

/**
 * @description Normalizes one mission without trusting optional backend fields.
 * @param {object} rawMission - Mission-like object from website-agent APIs.
 * @returns {object} Stable mission record for rendering.
 * @sideEffects None.
 */
export function normalizeSubAgentMission(rawMission = {}) {
	const agents = Array.isArray(rawMission.agents) ? rawMission.agents.slice(0, MAX_AGENTS) : [];
	const status = boundedSubAgentText(rawMission.status || rawMission.state || rawMission.phase || "unknown", 80);
	const id = boundedSubAgentText(rawMission.id || rawMission.websiteMissionId || rawMission.missionId || "unknown", 180);
	const active = Boolean(rawMission.activeInProcess) || /run|active|working|queued|starting/i.test(status);
	const backlogValue = rawMission.subagentBacklog;
	const backlog = Array.isArray(backlogValue) ? backlogValue.length : Number(backlogValue?.count || backlogValue || 0) || 0;
	return {
		id,
		missionId: boundedSubAgentText(rawMission.missionId || id, 180),
		goal: boundedSubAgentText(rawMission.goal || rawMission.prompt || rawMission.description || "No goal text reported."),
		status,
		active,
		agents: agents.map(normalizeSubAgentRosterEntry),
		agentCount: Number(rawMission.agentCount || agents.length || 0) || 0,
		backlog,
		updatedAt: boundedSubAgentText(rawMission.updatedAt || rawMission.lastUpdate || rawMission.at || "", 120)
	};
}

/**
 * @description Normalizes one agent row into bounded identity and depth information.
 * @param {object} rawAgent - Agent-like backend object.
 * @returns {object} Stable roster entry.
 * @sideEffects None.
 */
export function normalizeSubAgentRosterEntry(rawAgent = {}) {
	return {
		id: boundedSubAgentText(rawAgent.id || rawAgent.agentId || "agent", 180),
		name: boundedSubAgentText(rawAgent.name || rawAgent.displayName || rawAgent.id || "Sub-agent", 180),
		status: boundedSubAgentText(rawAgent.status || rawAgent.stage || rawAgent.state || "observed", 80),
		depth: Math.max(0, Math.min(32, Number(rawAgent.depth || 0) || 0)),
		parentAgentId: boundedSubAgentText(rawAgent.parentAgentId || "", 180)
	};
}

/**
 * @description Normalizes and bounds a mission collection for UI rendering.
 * @param {*} rawMissions - Unknown mission collection.
 * @returns {object[]} Bounded mission array.
 * @sideEffects None.
 */
export function normalizeSubAgentMissions(rawMissions) {
	return (Array.isArray(rawMissions) ? rawMissions : []).slice(0, MAX_MISSIONS).map(normalizeSubAgentMission);
}
