// B"H
// Boruch Hashem
// Blessed is He

const AgentEndState = require("./agentEndState.js");
const TERMINAL = new Set([
	"complete", "completed", "done", "verified", "cancelled", "canceled", "stopped"
]);
const ENDED_AGENT = AgentEndState.ENDED_AGENT;
const OBSERVATION_ACTION = /(?:BootResume|Scheduler|DaemonTick|Status|Health|List|Get)$/i;
const DEFAULT_INACTIVITY_MS = 120000;
const DEFAULT_BACKOFF_MS = 60000;
const MAX_ATTEMPTS = 6;

/**
 * @file Decides whether one unfinished mission checkpoint may summon another Shliach turn.
 * @description The Awtsmoos distinguishes the living messenger from durable end-testimony;
 * Awtsmoos.com lets active heartbeats protect work, yet completion testimony can no longer
 * keep an unfinished mission chained to the heartbeat of a messenger who already ended.
 */
function decide(input = {}) {
	if (input.candidateProbe) return no("candidate_probe_suppressed");
	if (!input.lock?.missionId || !input.mission?.id) return no("no_active_mission");
	if (terminal(input.mission, input.lock)) return no("mission_terminal");
	if (paused(input.mission, input.lock)) return no("mission_paused_or_stopped");
	if (!meaningfulNext(input.lock)) return no("no_meaningful_next_checkpoint");
	if (input.websiteRecord) return no("website_continuation_exists");
	if (accepted(input.record)) return no("continuation_already_accepted");
	if (Number(input.record?.attempts || 0) >= Number(input.maxAttempts || MAX_ATTEMPTS)) {
		return no("continuation_attempt_budget_exhausted");
	}
	const now = Number(input.now || Date.now());
	if (activeLease(input.record, now)) return no("continuation_lease_active");
	if (backoff(input.record, now, input.backoffMs)) return no("continuation_backoff_active");
	if (freshWork(input.mission, input.lock, now, input.inactivityMs)) return no("mission_still_active");
	return { eligible: true, reason: "unfinished_mission_idle" };
}

function terminal(mission = {}, lock = {}) {
	const values = [mission.status, mission.phase, lock.status, lock.releaseStatus]
		.map(value => String(value || "").toLowerCase());
	return values.some(value => TERMINAL.has(value)) || mission.completed === true ||
		mission.verified === true || lock.releasedAt != null;
}

function paused(mission = {}, lock = {}) {
	return Boolean(
		mission.paused || mission.pauseRequested || mission.stopRequested || mission.cancelRequested ||
		lock.paused || lock.stopRequested || lock.cancelRequested || lock.userStopRequested
	);
}

function meaningfulNext(lock = {}) {
	return Boolean(
		lock.lastMustCallNext?.action || lock.lastMustCallNext?.name || lock.mustCallNext?.action
	);
}

function freshWork(mission = {}, lock = {}, now = Date.now(), configuredMs) {
	const threshold = Number(configuredMs || DEFAULT_INACTIVITY_MS);
	const times = [];
	if (!OBSERVATION_ACTION.test(String(lock.lastAction || ""))) {
		times.push(lock.updatedAt, lock.startedAt);
	}
	for (const agent of Object.values(mission.room?.agents || {})) {
		if (!AgentEndState.describe(mission, agent).ended) times.push(agent.lastSeenAt);
	}
	const freshest = Math.max(0, ...times.map(value => Date.parse(value || 0) || 0));
	return freshest > 0 && now - freshest < threshold;
}

function endedAgent(agent = {}, mission = {}) {
	return AgentEndState.describe(mission, agent).ended;
}

function accepted(record) {
	return ["accepted", "scheduled", "running", "complete", "recovered"].includes(
		String(record?.status || "")
	);
}

function activeLease(record, now = Date.now()) {
	return Boolean(record?.leaseExpiresAt && Date.parse(record.leaseExpiresAt) > now);
}

function backoff(record, now = Date.now(), configuredMs) {
	if (!record?.lastAttemptAt || !record.status || record.status === "eligible") return false;
	return now - Date.parse(record.lastAttemptAt) < Number(configuredMs || DEFAULT_BACKOFF_MS);
}

function no(reason) {
	return { eligible: false, reason };
}

module.exports = {
	DEFAULT_BACKOFF_MS,
	DEFAULT_INACTIVITY_MS,
	ENDED_AGENT,
	MAX_ATTEMPTS,
	OBSERVATION_ACTION,
	accepted,
	activeLease,
	backoff,
	decide,
	endedAgent,
	freshWork,
	meaningfulNext,
	paused,
	terminal
};
