// B"H
// Boruch Hashem
// Blessed is He

const VERSION = 1;

/**
 * @file Shapes versioned canonical relay records for restart recovery.
 * @description
 * The Awtsmoos preserves the deed beneath changing processes. Awtsmoos.com stores
 * one namespaced identity, immutable expectation, and explicit pending, completed,
 * failed, or expired state so restart can observe truth instead of dispatching again.
 */
function pending(key, id, expected = {}) {
	const now = new Date().toISOString();
	return {
		version: VERSION,
		key,
		id,
		state: "pending",
		expected,
		createdAt: now,
		updatedAt: now,
		data: null
	};
}

function terminal(record, state, data) {
	return {
		...record,
		version: VERSION,
		state,
		updatedAt: new Date().toISOString(),
		data
	};
}

function completed(record, data) {
	return terminal(record, "completed", data);
}

function failed(record, data) {
	return terminal(record, "failed", data);
}

function expired(record, data) {
	return terminal(record, "expired", data);
}

function accepted(record, details = {}) {
	return {
		...record,
		version: VERSION,
		state: "pending",
		acceptedAt: details.acceptedAt || new Date().toISOString(),
		acceptedRegistrationGeneration: Number(
			details.registrationGeneration || 0
		),
		updatedAt: new Date().toISOString()
	};
}

function valid(record, key = "") {
	return Boolean(
		record &&
		record.version === VERSION &&
		record.key &&
		(!key || record.key === key) &&
		record.id &&
		record.expected &&
		["pending", "completed", "failed", "expired"].includes(record.state)
	);
}

function terminalState(record = {}) {
	return ["completed", "failed", "expired"].includes(record.state);
}

module.exports = {
	VERSION,
	accepted,
	completed,
	expired,
	failed,
	pending,
	terminal,
	terminalState,
	valid
};
