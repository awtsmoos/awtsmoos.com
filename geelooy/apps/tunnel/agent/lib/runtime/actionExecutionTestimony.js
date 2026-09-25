//B"H // Boruch Hashem // Blessed is He

/**
 * @file Extracts explicit execution testimony from any action result envelope.
 * @description The Awtsmoos never confuses acceptance with execution. Awtsmoos.com reads one
 * canonical vocabulary from every result shape — pending receipts, retry responses, async
 * reconciliations, nested batch children — so a Shliach can see whether a deed happened,
 * is still happening, or must only be observed, without re-reading each module's dialect.
 */

const TESTIMONY_STATES = [
	"unknown",
	"accepted_not_executed",
	"executing",
	"executed_terminal",
	"executed_failed",
	"interrupted_ambiguous",
	"never_started_failed",
	"fingerprint_conflict",
	"unknown_request",
	"replayed_terminal"
];

/**
 * Builds one explicit testimony from any result envelope. Never throws on odd input;
 * missing evidence yields the "unknown" state rather than a silent guess.
 */
function testify(input = {}) {
	const record = input && typeof input === "object" ? input : {};
	const state = stateOf(record);
	const mutation = mutationOf(record);
	const timestamps = timestampsOf(record);
	return {
		state,
		action: stringOf(record.action || record.requestedAction),
		requestId: stringOf(record.requestId || record.controlRequestId),
		controlRequestId: stringOf(record.controlRequestId || record.requestId),
		requestKey: stringOf(record.requestKey || record.idempotencyKey),
		ok: record.ok === true,
		status: record.status === undefined ? null : record.status,
		error: stringOf(record.error) || null,
		accepted: acceptedOf(record, state),
		executed: executedOf(record, state),
		terminal: terminalOf(record, state),
		observeOnly: observeOnlyOf(record, state),
		mutation,
		mutationAmbiguous: mutation.ambiguous,
		safeToReplay: safeToReplayOf(record, state, mutation),
		safeToRedispatch: safeToRedispatchOf(record, state, mutation),
		startedAt: timestamps.startedAt,
		completedAt: timestamps.completedAt,
		durationMs: timestamps.durationMs,
		sideEffects: sideEffectsOf(record),
		retry: {
			requestKey: stringOf(record.requestKey || record.idempotencyKey),
			dedupeKey: stringOf(record.dedupeKey || record.controlRequestId),
			attempt: numberOf(record.attempt || record.retryAttempt)
		},
		nested: nestedOf(record)
	};
}

function stateOf(record) {
	if (record.testimonyState && TESTIMONY_STATES.includes(record.testimonyState)) return record.testimonyState;
	if (record.error === "retry_request_not_found" || record.error === "control_request_not_found") return "unknown_request";
	if (record.error === "retry_action_conflict" || record.error === "control_request_id_conflict") return "fingerprint_conflict";
	if (record.replayed === true || record.duplicate === true) return "replayed_terminal";
	if (record.reconciliation && typeof record.reconciliation.state === "string") {
		return reconciliationState(record.reconciliation.state);
	}
	if (record.pending === true || record.accepted === true) {
		if (record.consumerStarted === true || record.executing === true) return "executing";
		return "accepted_not_executed";
	}
	if (record.ok === true) return "executed_terminal";
	if (record.ok === false && record.error) {
		if (record.startedAt && !record.completedAt) return "interrupted_ambiguous";
		if (!record.startedAt && record.accepted === true) return "never_started_failed";
		return "executed_failed";
	}
	return "unknown";
}

function reconciliationState(state) {
	const map = {
		process_missing_after_restart: "interrupted_ambiguous",
		interrupted: "interrupted_ambiguous",
		never_started: "never_started_failed",
		completed: "executed_terminal",
		failed: "executed_failed",
		running_unverified: "executing",
		running: "executing"
	};
	return map[state] || "unknown";
}

function mutationOf(record) {
	const intent = record.mutationIntent && typeof record.mutationIntent === "object" ? record.mutationIntent : {};
	const possible = intent.mutation === true || record.mutation === true || record.mutates === true;
	const pending = record.pending === true || record.accepted === true;
	const replaySafe = record.durable?.replaySafe === true || record.replaySafe === true;
	return {
		possible,
		ambiguous: possible && pending && !replaySafe,
		intentObserved: possible
	};
}

function acceptedOf(record, state) {
	if (typeof record.accepted === "boolean") return record.accepted;
	return ["accepted_not_executed", "executing", "interrupted_ambiguous"].includes(state);
}

function executedOf(record, state) {
	if (typeof record.executed === "boolean") return record.executed;
	return ["executed_terminal", "executed_failed", "replayed_terminal"].includes(state);
}

function terminalOf(record, state) {
	if (typeof record.terminal === "boolean") return record.terminal;
	return ["executed_terminal", "executed_failed", "replayed_terminal", "fingerprint_conflict", "unknown_request"].includes(state);
}

function observeOnlyOf(record, state) {
	if (typeof record.observeOnly === "boolean") return record.observeOnly;
	return ["accepted_not_executed", "executing", "interrupted_ambiguous", "fingerprint_conflict"].includes(state);
}

function safeToReplayOf(record, state, mutation) {
	if (typeof record.safeToReplay === "boolean") return record.safeToReplay;
	if (state === "replayed_terminal") return true;
	if (mutation.ambiguous) return false;
	return state === "executed_terminal" || state === "unknown_request";
}

function safeToRedispatchOf(record, state, mutation) {
	if (typeof record.safeToRedispatch === "boolean") return record.safeToRedispatch;
	return false;
}

function timestampsOf(record) {
	const startedAt = stringOf(record.startedAt || record.acceptedAt) || null;
	const completedAt = stringOf(record.completedAt || record.finishedAt) || null;
	let durationMs = numberOf(record.durationMs);
	if (durationMs === null && startedAt && completedAt) {
		const delta = Date.parse(completedAt) - Date.parse(startedAt);
		durationMs = Number.isFinite(delta) && delta >= 0 ? delta : null;
	}
	return { startedAt, completedAt, durationMs };
}

function sideEffectsOf(record) {
	const effects = record.sideEffects;
	if (Array.isArray(effects)) return effects.filter(item => item && typeof item === "object");
	const single = record.sideEffect;
	if (single && typeof single === "object") return [single];
	return [];
}

function nestedOf(record) {
	const children = record.children || record.results;
	if (!Array.isArray(children)) return [];
	return children
		.filter(child => child && typeof child === "object")
		.map(child => ({
			action: stringOf(child.action),
			state: stateOf(child),
			ok: child.ok === true,
			error: stringOf(child.error) || null,
			controlRequestId: stringOf(child.controlRequestId || child.requestId)
		}));
}

function stringOf(value) {
	if (typeof value === "string") return value;
	if (value === undefined || value === null) return "";
	return String(value);
}

function numberOf(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

module.exports = { TESTIMONY_STATES, nestedOf, stateOf, testify };
