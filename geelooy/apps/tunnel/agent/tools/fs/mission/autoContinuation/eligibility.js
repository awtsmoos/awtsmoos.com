//B"H
// Boruch Hashem
// Blessed is He

const State = require("./eligibilityState.js");

const DEFAULT_BACKOFF_MS = 60000;

/**
 * @file Admits successor generations only for runnable durable debt and safe custody.
 * @description The Awtsmoos never runs out of generations, yet Awtsmoos.com does not summon
 * agents for debt intentionally waiting on a human, blocker, deferral, or required review.
 */
function decide(input = {}) {
	if (input.candidateProbe) return no("candidate_probe_suppressed");
	if (!input.lock?.missionId || !input.mission?.id) return no("no_active_mission");
	if (State.paused(input.mission, input.lock)) return no("mission_paused_or_stopped");
	if (legacyMonitor(input)) return decideLegacyMonitor(input);
	if (input.completionDebt?.green === true) return no("completion_debt_green");
	if (input.completionDebt?.runnable === false) {
		return no(`completion_debt_${input.completionDebt.disposition || "non_runnable"}`);
	}
	const recovery = Boolean(input.debtRecovery);
	if (State.terminal(input.mission, input.lock) && !recovery) return no("mission_terminal");
	if (!input.taskLease?.continuationRequestId) return no("no_pre_step_continuation_request");
	if (!input.taskLease?.taskId || !input.taskLease?.leaseId) return no("no_unfinished_task_lease");
	if (!recovery && !State.meaningfulNext(input.lock)) return no("no_meaningful_next_checkpoint");
	if (input.websiteRecord) return no("website_continuation_exists");
	if (accepted(input.record)) return no("continuation_already_accepted");
	const now = Number(input.now || Date.now());
	if (activeLease(input.record, now)) return no("continuation_lease_active");
	if (backoff(input.record, now, input.backoffMs)) return no("continuation_backoff_active");
	if (!input.proactive && State.freshWork(input.mission, input.lock, now, input.inactivityMs)) {
		return no("mission_still_active");
	}
	if (input.proactive) return yes("proactive_pool_slot");
	return yes(recovery ? "completion_debt_recovery" : "declared_continuation_for_unfinished_task");
}

function legacyMonitor(input = {}) {
	return input.completionDebt === undefined && input.taskLease === undefined;
}

function decideLegacyMonitor(input = {}) {
	if (State.terminal(input.mission, input.lock)) return no("mission_terminal");
	if (input.websiteRecord) return no("website_continuation_exists");
	if (accepted(input.record)) return no("continuation_already_accepted");
	const now = Number(input.now || Date.now());
	if (activeLease(input.record, now)) return no("continuation_lease_active");
	if (backoff(input.record, now, input.backoffMs)) return no("continuation_backoff_active");
	if (State.freshWork(input.mission, input.lock, now, input.inactivityMs)) return no("mission_still_active");
	if (!State.meaningfulNext(input.lock)) return no("no_meaningful_next_checkpoint");
	return yes("unfinished_mission_idle");
}

function accepted(record) {
	return ["accepted", "scheduled", "running", "complete", "recovered"]
		.includes(String(record?.status || ""));
}

function activeLease(record, now = Date.now()) {
	return Boolean(record?.leaseExpiresAt && Date.parse(record.leaseExpiresAt) > now);
}

function backoff(record, now = Date.now(), configuredMs) {
	return Boolean(
		record?.lastAttemptAt
		&& record.status
		&& record.status !== "eligible"
		&& now - Date.parse(record.lastAttemptAt) < Number(configuredMs || DEFAULT_BACKOFF_MS)
	);
}

function no(reason) {
	return { eligible: false, reason };
}

function yes(reason) {
	return { eligible: true, reason };
}

module.exports = {
	DEFAULT_BACKOFF_MS,
	DEFAULT_INACTIVITY_MS: State.DEFAULT_INACTIVITY_MS,
	ENDED_AGENT: State.ENDED_AGENT,
	OBSERVATION_ACTION: State.OBSERVATION_ACTION,
	accepted,
	activeLease,
	backoff,
	decide,
	decideLegacyMonitor,
	endedAgent: State.endedAgent,
	freshWork: State.freshWork,
	legacyMonitor,
	meaningfulNext: State.meaningfulNext,
	paused: State.paused,
	terminal: State.terminal
};
