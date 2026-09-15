//B"H
// Boruch Hashem
// Blessed is He

const AgentEndState = require("./agentEndState.js");

const TERMINAL = new Set(["complete", "completed", "done", "verified", "cancelled", "canceled", "stopped"]);
const OBSERVATION_ACTION = /(?:BootResume|Scheduler|DaemonTick|Status|Health|List|Get)$/i;
const DEFAULT_INACTIVITY_MS = 120000;

/**
 * @file Holds Mission-state predicates used by continuation admission.
 * @description The Awtsmoos keeps state-reading separate from admission choice so the gate stays
 * small, testable, and fast while still honoring terminal, paused, freshness, and ended-agent truth.
 */
function terminal(mission = {}, lock = {}) {
	const values = [mission.status, mission.phase, lock.status, lock.releaseStatus]
		.map(value => String(value || "").toLowerCase());
	return values.some(value => TERMINAL.has(value))
		|| mission.completed === true
		|| mission.verified === true
		|| lock.releasedAt != null;
}

function paused(mission = {}, lock = {}) {
	return Boolean(
		mission.paused || mission.pauseRequested || mission.stopRequested || mission.cancelRequested
		|| lock.paused || lock.stopRequested || lock.cancelRequested || lock.userStopRequested
	);
}

function meaningfulNext(lock = {}) {
	return Boolean(lock.lastMustCallNext?.action || lock.lastMustCallNext?.name || lock.mustCallNext?.action);
}

function freshWork(mission = {}, lock = {}, now = Date.now(), configuredMs) {
	const threshold = Number(configuredMs || DEFAULT_INACTIVITY_MS);
	const times = [];
	if (!OBSERVATION_ACTION.test(String(lock.lastAction || ""))) times.push(lock.updatedAt, lock.startedAt);
	for (const agent of Object.values(mission.room?.agents || {})) {
		if (!AgentEndState.describe(mission, agent).ended) times.push(agent.lastSeenAt);
	}
	const freshest = Math.max(0, ...times.map(value => Date.parse(value || 0) || 0));
	return freshest > 0 && now - freshest < threshold;
}

function endedAgent(agent = {}, mission = {}) {
	return AgentEndState.describe(mission, agent).ended;
}

module.exports = {
	DEFAULT_INACTIVITY_MS,
	ENDED_AGENT: AgentEndState.ENDED_AGENT,
	OBSERVATION_ACTION,
	endedAgent,
	freshWork,
	meaningfulNext,
	paused,
	terminal
};
