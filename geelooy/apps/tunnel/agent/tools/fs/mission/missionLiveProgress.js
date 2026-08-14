// B"H
// Boruch Hashem
// Blessed is He

const Agents = require("./missionLiveProgressAgents.js");
const Identity = require("./missionLiveProgressIdentity.js");
const Plan = require("./missionPlanContext.js");
const DEFAULT_STALE_MS = 120000;
const TERMINAL = new Set([
	"done", "completed", "succeeded", "failed", "cancelled", "stopped", "aborted"
]);

/**
 * @file Reveals live mission checkpoint, unfinished work, identity, and succession without mutation.
 * @description The Awtsmoos lets Tunnel Control witness a mission without becoming its heartbeat;
 * Awtsmoos.com composes bounded plan, messenger, and continuation testimony while leaving all
 * leases, locks, heartbeat clocks, and dispatch authority untouched.
 */
function build(mission = {}, options = {}) {
	const now = Number(options.now || Date.now());
	const staleMs = boundedMs(options.staleMs);
	const plan = Plan.build(mission, { lock: options.lock });
	const agents = Agents.project(mission, now, staleMs);
	const identity = Identity.project(mission, options.lock, agents);
	const continuation = projectContinuation(options.continuation);
	const staleAgents = agents.filter(agent => agent.stale);
	const endedAgents = agents.filter(agent => agent.ended);
	const terminal = TERMINAL.has(String(mission.status || "").toLowerCase());
	const recoveryRequired = !terminal && Boolean(
		staleAgents.length || endedAgents.length || activeContinuation(continuation)
	);
	return {
		missionId: plan.missionId,
		...identity,
		goal: plan.goal,
		status: plan.status,
		phase: plan.phase,
		counts: plan.counts,
		completionPercent: plan.completionPercent,
		latestCheckpoint: plan.latestCheckpoint,
		recoveryCheckpoint: continuation?.recoveryCheckpoint || null,
		lastCompletedTask: plan.lastCompletedTask,
		unfinishedTasks: plan.unfinishedTasks,
		openJobs: plan.openJobs,
		blockers: plan.blockers,
		openUserMessages: plan.openUserMessages,
		nextRequiredAction: plan.nextRequiredAction,
		recentPlans: plan.recentPlans,
		latestRecentPlan: last(plan.recentPlans),
		agents,
		activeClaims: plan.activeClaims,
		openDelegations: plan.openDelegations,
		latestHandoff: plan.latestHandoff,
		continuation,
		recoveryRequired,
		recoveryState: recoveryState(continuation, staleAgents, endedAgents),
		observedAt: new Date(now).toISOString()
	};
}

/** Projects agents without mutating durable room or collaboration testimony. */
function projectAgents(mission, now = Date.now(), staleMs = DEFAULT_STALE_MS) {
	return Agents.project(mission, now, boundedMs(staleMs));
}

/** Projects only durable continuation testimony; it never renews the continuation lease. */
function projectContinuation(record) {
	if (!record) return null;
	return {
		status: Plan.text(record.status, 80),
		fingerprint: Plan.text(record.fingerprint, 80),
		attempts: Number(record.attempts || 0),
		recoveryReason: Plan.text(record.recoveryReason, 160),
		predecessorAgentId: Plan.text(record.predecessorAgentId, 120),
		predecessorLastSeenAt: Plan.text(record.predecessorLastSeenAt, 80),
		predecessorEndReason: Plan.text(record.predecessorEndReason, 160),
		predecessorEndedAt: Plan.text(record.predecessorEndedAt, 80),
		successorAgentId: Plan.text(record.successorAgentId, 120),
		websiteMissionId: Plan.text(record.websiteMissionId, 160),
		leaseExpiresAt: Plan.text(record.leaseExpiresAt, 80),
		lastAttemptAt: Plan.text(record.lastAttemptAt, 80),
		lastRecoveryAt: Plan.text(record.lastRecoveryAt || record.recoveredAt || record.lastAttemptAt, 80),
		lastError: Plan.text(record.lastError, 400),
		recoveryCheckpoint: record.recoveryCheckpoint || null
	};
}

/** Names the current recovery posture from existing continuation and agent evidence. */
function recoveryState(continuation, staleAgents, endedAgents) {
	if (continuation?.status) return continuation.status;
	if (endedAgents.length) return "ended_agent_detected";
	if (staleAgents.length) return "stale_agent_detected";
	return "idle";
}

/** Recognizes continuation states that already own recovery authority. */
function activeContinuation(record) {
	return Boolean(record && new Set([
		"dispatching", "accepted", "scheduled", "running", "recovered"
	]).has(record.status));
}

/** Bounds stale-heartbeat policy for observation without changing the durable policy source. */
function boundedMs(value) {
	const number = Number(value || DEFAULT_STALE_MS);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(number, 3600000))
		: DEFAULT_STALE_MS;
}

/** Returns the newest member of an already bounded projection. */
function last(values = []) {
	return values[values.length - 1] || null;
}
module.exports = {
	DEFAULT_STALE_MS,
	build,
	projectAgents,
	projectContinuation
};