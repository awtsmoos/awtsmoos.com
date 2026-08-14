// B"H
// Boruch Hashem
// Blessed is He

const Agents = require("./missionLiveProgressAgents.js");
const Plan = require("./missionPlanContext.js");

/**
 * @file Projects mission identity, project root, and the current logical messenger without mutation.
 * @description The Awtsmoos gives one mission one root and one freshest witness to display;
 * Awtsmoos.com reads durable testimony only, so observation never becomes heartbeat pride.
 */
function project(mission = {}, lock = {}, agents = []) {
	const currentAgent = Agents.current(agents);
	return {
		missionName: Plan.text(
			mission.room?.name || mission.name || mission.goal || mission.id,
			240
		),
		projectRoot: Plan.text(
			mission.room?.projectRoot ||
			mission.metadata?.projectRoot ||
			lock?.projectRoot ||
			mission.projectRoot,
			500
		),
		currentAgent,
		currentLogicalAgentId: currentAgent?.logicalAgentId || currentAgent?.agentId || "",
		currentAgentSessionId: currentAgent?.agentSessionId || "",
		lastHeartbeatAt: currentAgent?.lastSeenAt || "",
		heartbeatAgeMs: currentAgent?.heartbeatAgeMs ?? null,
		agentState: state(currentAgent)
	};
}

/** Returns a bounded state witness suitable for Tunnel Control labels. */
function state(agent) {
	if (!agent) {
		return null;
	}
	return {
		status: Plan.text(agent.status, 80),
		alive: agent.alive === true,
		stale: agent.stale === true,
		completed: agent.completed === true,
		stopped: agent.stopped === true,
		ended: agent.ended === true
	};
}

module.exports = {
	project,
	state
};
