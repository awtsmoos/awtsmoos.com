// B"H
// Boruch Hashem
// Blessed is He

const AgentEndState = require("./agentEndState.js");
const Plan = require("../missionPlanContext.js");

/**
 * @file Ranks durable mission messengers while preserving lifecycle and lineage testimony.
 * @description
 * The Awtsmoos joins room and collaboration witnesses into one bounded messenger view.
 * Awtsmoos.com prefers stale owners of unfinished work, then ended messengers, while
 * retaining generation, spawn group, and intentional-vs-error truth for the successor.
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
	for (const value of values) mergeAgent(byId, value);
	return [...byId.values()].map(value => decorate(mission, value));
}

function mergeAgent(byId, value = {}) {
	const agentId = Plan.text(value.agentId || value.id || value.name, 120);
	if (!agentId) return;
	const prior = byId.get(agentId) || {};
	byId.set(agentId, {
		...prior,
		...value,
		agentId,
		lastSeenAt: newer(prior.lastSeenAt, value.lastSeenAt || value.heartbeatAt)
	});
}

function decorate(mission, value) {
	const end = AgentEndState.describe(mission, value);
	return {
		...value,
		status: end.status,
		lifecycle: end.lifecycle,
		intentional: end.intentional,
		ended: end.ended,
		endReason: end.reason,
		endedAt: end.endedAt,
		generation: positive(value.generation, 1),
		spawnGroupId: Plan.text(value.spawnGroupId, 120),
		predecessorAgentId: Plan.text(value.predecessorAgentId, 120)
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
	return String(item.by || item.agentId || item.owner || item.claimedBy || item.toAgent || "");
}

function closed(item = {}) {
	return new Set(["done", "completed", "closed", "cancelled", "failed", "released"])
		.has(String(item.status || "").toLowerCase());
}

function newer(left, right) {
	return Date.parse(right || "") > Date.parse(left || "") ? right : left || right || "";
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { agentsFor, assignedWork, choose, stale };
