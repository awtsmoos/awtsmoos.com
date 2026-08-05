// B"H
// Boruch Hashem
// Blessed is He

const VERSION = 2;
const SUPPORTED_VERSIONS = new Set([1, VERSION]);
const TERMINAL_STATES = new Set(["completed", "failed", "expired"]);

/**
 * @file Shapes versioned canonical relay records for restart recovery.
 * @description
 * The Awtsmoos preserves one deed while processes vanish and return. Awtsmoos.com
 * stores reservation, dispatch, device custody, progress, and terminal truth without
 * allowing a later nonterminal witness to overwrite a completed response.
 */
function pending(key, id, expected = {}) {
	const now = new Date().toISOString();
	return {
		version: VERSION,
		key,
		id,
		state: "pending",
		phase: "reserved",
		expected,
		createdAt: now,
		updatedAt: now,
		data: null
	};
}

function dispatched(record, details = {}) {
	return transition(record, {
		phase: "dispatched",
		dispatchedAt: details.dispatchedAt || new Date().toISOString(),
		dispatchRegistrationGeneration: number(details.registrationGeneration)
	});
}

function accepted(record, details = {}) {
	return transition(record, {
		phase: "device_accepted",
		acceptedAt: details.acceptedAt || new Date().toISOString(),
		acceptedRegistrationGeneration: number(details.registrationGeneration)
	});
}

function progressed(record, details = {}) {
	return transition(record, compact({
		phase: "progress",
		progressAt: details.progressAt || new Date().toISOString(),
		progressPhase: details.progressPhase,
		lane: details.lane,
		jobId: details.jobId,
		taskId: details.taskId,
		workerId: details.workerId
	}));
}

function transition(record, details) {
	if (terminalState(record)) return record;
	return {
		...record,
		...details,
		version: VERSION,
		state: "pending",
		updatedAt: new Date().toISOString()
	};
}

function terminal(record, state, data) {
	return {
		...record,
		version: VERSION,
		state,
		phase: state,
		updatedAt: new Date().toISOString(),
		data
	};
}

function completed(record, data) { return terminal(record, "completed", data); }
function failed(record, data) { return terminal(record, "failed", data); }
function expired(record, data) { return terminal(record, "expired", data); }

function valid(record, key = "") {
	return Boolean(record) &&
		SUPPORTED_VERSIONS.has(record.version) &&
		record.key &&
		(!key || record.key === key) &&
		record.id &&
		record.expected &&
		(record.state === "pending" || TERMINAL_STATES.has(record.state));
}

function terminalState(record = {}) { return TERMINAL_STATES.has(record.state); }
function number(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
function compact(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => (
		item !== undefined && item !== null && item !== ""
	)));
}

module.exports = {
	VERSION, accepted, completed, dispatched, expired, failed, pending, progressed,
	terminal, terminalState, transition, valid
};
