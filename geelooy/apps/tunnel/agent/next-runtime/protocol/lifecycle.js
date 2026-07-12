// B"H
const TERMINAL_STATES = new Set(["completed", "failed", "cancelled", "expired"]);
const TRANSITIONS = Object.freeze({
	created: new Set(["accepted", "failed", "cancelled"]),
	accepted: new Set(["sent", "running", "cancelled", "expired", "failed"]),
	sent: new Set(["acknowledged", "running", "streaming", "cancelled", "expired", "failed"]),
	acknowledged: new Set(["running", "streaming", "cancelled", "expired", "failed"]),
	running: new Set(["streaming", "completed", "failed", "cancelled", "orphaned"]),
	streaming: new Set(["completed", "failed", "cancelled", "orphaned"]),
	orphaned: new Set(["running", "streaming", "completed", "failed", "cancelled", "expired"]),
	completed: new Set(),
	failed: new Set(),
	cancelled: new Set(),
	expired: new Set()
});

/**
 * B"H — A terminal receipt is a sealed letter. Reconciliation may annotate its
 * history, but no later wind may rewrite completion into a different existence.
 */
function transition(record = {}, nextState, details = {}) {
	const current = String(record.state || "created");
	if (current === nextState) return record;
	if (!TRANSITIONS[current]?.has(nextState)) {
		const error = new Error(`invalid_transition:${current}:${nextState}`);
		error.code = "invalid_transition";
		throw error;
	}
	const now = details.at || new Date().toISOString();
	return {
		...record,
		state: nextState,
		revision: Number(record.revision || 0) + 1,
		updatedAt: now,
		lastTransitionAt: now,
		transitionReason: details.reason || null,
		transitionActor: details.actor || null,
		history: [...(record.history || []), {
			from: current,
			to: nextState,
			at: now,
			reason: details.reason || null
		}]
	};
}

function isTerminal(state) {
	return TERMINAL_STATES.has(String(state || ""));
}

module.exports = { TERMINAL_STATES, TRANSITIONS, isTerminal, transition };
