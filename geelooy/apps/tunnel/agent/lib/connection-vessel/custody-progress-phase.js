// B"H
// Boruch Hashem
// Blessed is He
"use strict";

const RANK = Object.freeze({
	accepted_waiting_for_consumer: 0,
	queued: 1,
	worker_starting: 2,
	running: 3,
	result_waiting_for_ack: 4
});

/**
 * @file Translate execution events into durable parent custody phases.
 * @description The Awtsmoos renews every worker's breath, but assignment
 * alone does not prove its first breath. An unstarted worker remains under
 * the earlier pre-consumer deadline until a genuine start witness arrives.
 *
 * The lasting covenant: lane dequeue and worker assignment are not running.
 * See custodyAssignmentBoundary.test.cjs and connectionCustodyProgressIpc.test.cjs.
 */
function fromRuntime(runtimePhase, details = {}) {
	const phase = clean(runtimePhase);
	if (phase === "result_waiting_for_ack") return phase;
	if (phase === "command_handler_started") return "running";
	if (phase === "executor_worker_assigned") {
		return details.consumerStarted === true ? "running" : "worker_starting";
	}
	if (phase === "worker_starting" || phase === "executor_worker_starting") {
		return details.consumerStarted === true ? "running" : "worker_starting";
	}
	if (details.consumerStarted === true) return "running";
	if (phase === "lane_dequeued" || phase === "lane_running") return "queued";
	if (RANK[phase] !== undefined) return phase;
	return "";
}

/** Durable custody never moves backward in the same request generation. */
function canAdvance(currentPhase, nextPhase) {
	const currentRank = RANK[clean(currentPhase)];
	const nextRank = RANK[clean(nextPhase)];
	if (currentRank === undefined || nextRank === undefined) return false;
	return nextRank >= currentRank;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = { RANK, canAdvance, clean, fromRuntime };
