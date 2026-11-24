//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Durable command-job lifecycle state machine.
 * @description Distinguishes never-accepted, accepted, queued, running,
 * completed, failed, canceled, temporarily unavailable and genuinely unknown.
 * A transmitted request is never, by itself, reported as success.
 */

const STATES = Object.freeze([
	"not_accepted", "accepted", "queued", "running", "completed",
	"failed", "canceled", "result_unavailable", "connection_lost", "unknown"
]);

const TRANSITIONS = Object.freeze({
	not_accepted: ["accepted", "failed"],
	accepted: ["queued", "running", "failed", "canceled", "connection_lost", "unknown"],
	queued: ["running", "failed", "canceled", "connection_lost", "unknown"],
	running: ["completed", "failed", "canceled", "result_unavailable", "connection_lost", "unknown"],
	completed: [],
	failed: [],
	canceled: [],
	result_unavailable: ["completed", "failed", "unknown"],
	connection_lost: ["queued", "running", "completed", "failed", "unknown"],
	unknown: ["completed", "failed", "canceled", "unknown"]
});

const TERMINAL = new Set(["completed", "failed", "canceled"]);

/**
 * @param {string} from Current state.
 * @param {string} to Proposed state.
 * @returns {boolean} Whether the transition is legal.
 */
function canTransition(from, to) {
	return Boolean(TRANSITIONS[from] && TRANSITIONS[from].includes(to));
}

/**
 * Applies a transition or throws — illegal transitions are programming errors.
 * @param {{state:string, history?:Array}} job Mutable job record.
 * @param {string} to Next state.
 * @param {number} [at] Timestamp ms.
 * @returns {object} The job.
 */
function transition(job, to, at = Date.now()) {
	if (!canTransition(job.state, to)) throw new Error(`illegal job transition ${job.state} -> ${to}`);
	job.state = to;
	(job.history ||= []).push({ state: to, at });
	if (TERMINAL.has(to)) job.finishedAt = at;
	return job;
}

/** @param {string} state @returns {boolean} Whether no further work will occur. */
function isTerminal(state) { return TERMINAL.has(state); }

/**
 * Whether blindly re-running is safe. Only never-accepted work may be resent
 * without reconciliation; unknown/connection-lost must be reconciled first.
 * @param {string} state @returns {boolean}
 */
function mayRetryBlindly(state) { return state === "not_accepted"; }

module.exports = { STATES, TRANSITIONS, canTransition, transition, isTerminal, mayRetryBlindly };
