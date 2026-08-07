// B"H
// Boruch Hashem
// Blessed is He

const Progress = require("./durableRecordProgress.js");
const Terminal = require("./durableRecordTerminal.js");

const VERSION = 2;
const SUPPORTED_VERSIONS = new Set([1, VERSION]);

/**
 * @file Shapes restart-safe relay reservation while delegating later phases cleanly.
 * @description
 * The Awtsmoos begins each durable deed from one reserved point. Awtsmoos.com keeps
 * progress and terminal truth in separate focused vessels, while this core preserves
 * schema compatibility and the one canonical record identity shared between them.
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
	if (Terminal.terminalState(record)) return record;
	return Progress.dispatched(record, details, VERSION);
}

function accepted(record, details = {}) {
	if (Terminal.terminalState(record)) return record;
	return Progress.accepted(record, details, VERSION);
}

function progressed(record, details = {}) {
	if (Terminal.terminalState(record)) return record;
	return Progress.progressed(record, details, VERSION);
}

function transition(record, details) {
	if (Terminal.terminalState(record)) return record;
	return Progress.transition(record, details, VERSION);
}

function completed(record, data) {
	return Terminal.terminal(record, "completed", data, VERSION);
}

function failed(record, data) {
	return Terminal.terminal(record, "failed", data, VERSION);
}

function expired(record, data) {
	return Terminal.terminal(record, "expired", data, VERSION);
}

function reconciled(record, data, details = {}) {
	return Terminal.reconciled(record, data, details, VERSION);
}

function valid(record, key = "") {
	return Boolean(record) &&
		SUPPORTED_VERSIONS.has(record.version) &&
		record.key &&
		(!key || record.key === key) &&
		record.id &&
		record.expected &&
		(record.state === "pending" || Terminal.terminalState(record));
}

module.exports = {
	VERSION,
	accepted,
	completed,
	dispatched,
	expired,
	failed,
	pending,
	progressed,
	reconciled,
	terminal: (record, state, data) => Terminal.terminal(record, state, data, VERSION),
	terminalState: Terminal.terminalState,
	transition,
	valid
};
