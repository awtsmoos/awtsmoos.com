// B"H
// Boruch Hashem
// Blessed is He

const AgentEndState = require("./agentEndState.js");
const Plan = require("../missionPlanContext.js");

/**
 * @file Ranks durable mission messengers for one successor handoff.
 * @description The Awtsmoos joins room and collaboration testimony into one bounded
 * messenger view; Awtsmoos.com prefers stale owners of unfinished work, then explicit
 * ended messengers, while keeping every identity and heartbeat witness inspectable.
 */
function choose(mission = {}, now = Date.now(), inactivityMs = 120000) {
	const agents = agentsFor(mission);
	const staleAgents = agents.filter(agent => stale(agent, now, inactivityMs));
	const assigned = staleAgents.filter(agent => assignedWork(mission, agent.agentId));
	if (assigned.length) return latest(assigned);
	if (staleAgents.length) return latest(staleAgents);
	const ended = agents.filter(agent => agent.ended === true);
	return ended.length ? latest(ended) : latest(agents);
}

function agentsFor(mission = {}) {
	const values = [
		...Plan.list(mission.room?.agents),
		...Plan.list(mission.collaboration?.agents)
	];
	const byId = new Map();
	for (const value of values) {
		const agentId = Plan.text(value?.agentId || value?.id || value?.name, 120);
		if (!agentId) continue;
		const prior = byId.get(agentId) || {};
		byId.set(agentId, {
			...prior,
			...value,
			agentId,
			lastSeenAt: newer(prior.lastSeenAt, value?.lastSeenAt || value?.heartbeatAt)
		});
	}
	return [...byId.values()].map(value => decorate(mission, value));
}

function decorate(mission, value) {
	const end = AgentEndState.describe(mission, value);
	return {
		...value,
		status: end.status,
		ended: end.ended,
		endReason: end.reason,
		endedAt: end.endedAt
	};
}

function stale(agent = {}, now = Date.now(), inactivityMs = 120000) {
	if (agent.ended) return false;
	const at = Date.parse(agent.lastSeenAt || agent.joinedAt || "");
	return Number.isFinite(at) && now - at >= inactivityMs;
}

function assignedWork(mission, agentId) {
	const collaboration = mission.room || mission.collaboration || {};
	return [...Plan.list(collaboration.claims), ...Plan.list(collaboration.delegations)]
		.some(item => !closed(item) && owner(item) === agentId);
}

function latest(agents) {
	return [...agents].sort((left, right) => timestamp(right) - timestamp(left))[0] || null;
}

function timestamp(agent) {
	const value = Date.parse(agent?.endedAt || agent?.lastSeenAt || agent?.joinedAt || "");
	return Number.isFinite(value) ? value : 0;
}

function owner(item = {}) {
	return String(
		item.by || item.agentId || item.owner || item.claimedBy || item.toAgent || ""
	);
}

function closed(item = {}) {
	return new Set([
		"done", "completed", "closed", "cancelled", "failed", "released"
	]).has(String(item.status || "").toLowerCase());
}

function newer(left, right) {
	return Date.parse(right || "") > Date.parse(left || "") ? right : left || right || "";
}

module.exports = {
	agentsFor,
	assignedWork,
	choose,
	stale
};
