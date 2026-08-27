// B"H
const TERMINAL = new Set([
	"completed",
	"failed",
	"timed_out",
	"cancelled",
	"cleanup_failed",
	"stale_lost_worker",
	"identity_unverified"
]);

const ALLOWED = Object.freeze({
	created: new Set(["spawning", "failed", "cancelled"]),
	spawning: new Set(["running", "failed", "cancelled", "identity_unverified"]),
	running: new Set(["cancelling", "completed", "failed", "timed_out", "cleanup_failed", "stale_lost_worker", "identity_unverified"]),
	detached_running: new Set(["cancelling", "completed", "failed", "timed_out", "cleanup_failed", "stale_lost_worker", "identity_unverified"]),
	cancelling: new Set(["cleaning", "cancelled", "failed", "cleanup_failed", "identity_unverified"]),
	cleaning: new Set(["cancelled", "failed", "cleanup_failed", "identity_unverified"]),
	completed: new Set(),
	failed: new Set(),
	timed_out: new Set(),
	cancelled: new Set(),
	cleanup_failed: new Set(),
	stale_lost_worker: new Set(),
	identity_unverified: new Set()
});

/**
 * B"H — A finished command cannot be resurrected by a late heartbeat or close.
 * Every transition names its expected revision and records the reason for change.
 */
function transition(record = {}, nextState, options = {}) {
	const currentState = String(record.status || record.state || "created");
	const expectedRevision = options.expectedRevision;
	const currentRevision = Number(record.revision || 0);
	if (expectedRevision !== undefined && currentRevision !== expectedRevision) {
		throw failure("command_revision_conflict", { currentRevision });
	}
	if (currentState === nextState) return structuredClone(record);
	if (!ALLOWED[currentState]?.has(nextState)) {
		throw failure("invalid_command_transition", { currentState, nextState });
	}
	const now = options.at || new Date().toISOString();
	return {
		...record,
		status: nextState,
		state: nextState,
		revision: currentRevision + 1,
		updatedAt: now,
		lastTransitionAt: now,
		transitionReason: options.reason || null,
		transitionActor: options.actor || null,
		history: [
			...(record.history || []),
			{ from: currentState, to: nextState, at: now, reason: options.reason || null }
		]
	};
}

function isTerminal(state) {
	return TERMINAL.has(String(state || ""));
}

function failure(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}

module.exports = { ALLOWED, TERMINAL, isTerminal, transition };
