// B"H
const TERMINAL = new Set([
	"completed",
	"failed",
	"timed_out",
	"cancelled",
	"stale_lost_worker",
	"orphan_cleaned"
]);

const TRANSITIONS = Object.freeze({
	accepted: new Set(["queued", "spawning", "cancelled", "failed"]),
	queued: new Set(["spawning", "cancelled", "failed"]),
	spawning: new Set(["running", "failed", "cancelled", "stale_lost_worker"]),
	running: new Set(["cancelling", "completed", "failed", "timed_out", "stale_lost_worker"]),
	cancelling: new Set(["cancelled", "completed", "failed", "timed_out", "orphan_cleaned"]),
	orphaned: new Set(["cancelling", "stale_lost_worker", "orphan_cleaned"]),
	completed: new Set(),
	failed: new Set(),
	timed_out: new Set(),
	cancelled: new Set(),
	stale_lost_worker: new Set(),
	orphan_cleaned: new Set()
});

/**
 * B"H — A terminal receipt is sealed. Competing exits may repeat the same truth,
 * but no later callback may turn completion into failure or resurrect old work.
 */
function transition(record = {}, nextState, input = {}) {
	const current = String(record.state || "accepted");
	if (current === nextState) return record;
	if (!TRANSITIONS[current]?.has(nextState)) throw failure("invalid_command_transition", { current, nextState });
	if (input.expectedRevision !== undefined && Number(record.revision || 0) !== input.expectedRevision) {
		throw failure("command_revision_conflict", { currentRevision: record.revision });
	}
	const at = input.at || new Date().toISOString();
	return {
		...record,
		state: nextState,
		revision: Number(record.revision || 0) + 1,
		updatedAt: at,
		lastTransitionAt: at,
		transitionReason: input.reason || "",
		history: [...(record.history || []), { from: current, to: nextState, at, reason: input.reason || "" }]
	};
}

function isTerminal(state) {
	return TERMINAL.has(String(state || ""));
}

function failure(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}

module.exports = { TERMINAL, TRANSITIONS, isTerminal, transition };
