// B"H
// Boruch Hashem
// Blessed is He

const AgentEndState = require("./autoContinuation/agentEndState.js");
const Plan = require("./missionPlanContext.js");
const COMPLETED = new Set(["complete", "completed", "done", "succeeded"]);

/**
 * @file Projects bounded logical-agent identity, heartbeat, and durable end-state testimony.
 * @description The Awtsmoos reveals which Shliach is active without making observation a pulse;
 * Awtsmoos.com joins room and collaboration witnesses while no heartbeat or lease gets a jolt.
 */
function project(mission = {}, now = Date.now(), staleMs = 120000) {
	return [...mergeAgents(mission).values()]
		.map(value => projectOne(mission, value, now, staleMs))
		.sort((left, right) => right.heartbeatAgeMs - left.heartbeatAgeMs)
		.slice(0, 24);
}

/** Selects the freshest non-ended logical agent, with a freshest-known fallback. */
function current(agents = []) {
	const living = agents.filter(agent => !agent.ended);
	const candidates = living.length ? living : agents;
	return [...candidates]
		.sort((left, right) => freshness(right) - freshness(left))[0] || null;
}

/** Merges duplicate messenger testimony without mutating either durable source. */
function mergeAgents(mission) {
	const byId = new Map();
	const values = [
		...Plan.list(mission.room?.agents),
		...Plan.list(mission.collaboration?.agents)
	];
	for (const value of values) {
		const agentId = Plan.text(value?.agentId || value?.logicalAgentId || value?.id || value?.name, 120);
		if (!agentId) continue;
		const prior = byId.get(agentId) || {};
		byId.set(agentId, {
			...prior,
			...value,
			agentId,
			lastSeenAt: latestTime(
				prior.lastSeenAt,
				value?.lastSeenAt || value?.heartbeatAt || value?.joinedAt
			)
		});
	}
	return byId;
}

/** Converts one durable agent witness into bounded read-only control-plane state. */
function projectOne(mission, value, now, staleMs) {
	const end = AgentEndState.describe(mission, value);
	const heartbeatAgeMs = age(value.lastSeenAt, now);
	const stale = !end.ended && Boolean(value.lastSeenAt && heartbeatAgeMs >= staleMs);
	const status = String(end.status || "").toLowerCase();
	return {
		agentId: Plan.text(value.agentId, 120),
		logicalAgentId: Plan.text(value.logicalAgentId || value.agentId, 120),
		agentSessionId: Plan.text(value.agentSessionId || value.sessionId, 160),
		status: end.status,
		rawStatus: end.rawStatus,
		lastSeenAt: Plan.text(value.lastSeenAt, 80),
		heartbeatAgeMs,
		alive: !end.ended && !stale,
		stale,
		completed: COMPLETED.has(status),
		stopped: status === "stopped",
		ended: end.ended,
		endReason: end.reason,
		endedAt: end.endedAt
	};
}

/** Computes bounded heartbeat age without making a missing timestamp look stale. */
function age(value, now) {
	const at = Date.parse(value || "");
	return Number.isFinite(at) ? Math.max(0, now - at) : 0;
}

/** Returns a timestamp score used only for deterministic current-agent selection. */
function freshness(value) {
	const at = Date.parse(value?.lastSeenAt || "");
	return Number.isFinite(at) ? at : 0;
}

/** Keeps the newest truthful timestamp when room and collaboration witnesses overlap. */
function latestTime(left, right) {
	return Date.parse(right || "") > Date.parse(left || "") ? right : left || right || "";
}

module.exports = {
	current,
	project
};
