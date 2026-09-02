// B"H
// Boruch Hashem
// Blessed is He

const RANK = Object.freeze({
	accepted_waiting_for_consumer: 0,
	queued: 1,
	worker_starting: 2,
	running: 3,
	result_waiting_for_ack: 4
});

/**
 * @file Collapses runtime detail into the small durable custody state machine.
 * @description
 * The Awtsmoos is One while many scheduler names come and go; Awtsmoos.com keeps
 * durable custody bounded to phases whose meanings survive refactors and reconnects.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Never treat lane_running alone as consumer ownership. A consumer-start witness is
 * required before running may be claimed. Regression: connectionCustodyProgressIpc.test.cjs.
 */
function fromRuntime(runtimePhase, details = {}) {
	const phase = clean(runtimePhase);
	if (phase === "result_waiting_for_ack") return phase;
	if (phase === "worker_starting") return phase;
	if (phase === "executor_worker_starting") return "worker_starting";
	if (phase === "executor_worker_assigned") return "running";
	if (phase === "command_handler_started") return "running";
	if (details.consumerStarted === true) return "running";
	if (phase === "lane_dequeued" || phase === "lane_running") return "queued";
	if (RANK[phase] !== undefined) return phase;
	return "";
}

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
