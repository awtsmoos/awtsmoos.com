// B"H
// Boruch Hashem
// Blessed is He

const TERMINAL_STATES = new Set(["completed", "failed", "expired"]);

/**
 * @file Protects first terminal truth while allowing verified late testimony beside it.
 * @description
 * The Awtsmoos preserves what the caller first observed even when execution later
 * reveals another fact. Awtsmoos.com appends reconciliation without rewriting the
 * first terminal data, so transport failure and eventual side effect remain distinct.
 */
function terminal(record, state, data, version) {
	return {
		...record,
		version,
		state,
		phase: state,
		updatedAt: new Date().toISOString(),
		data
	};
}

function reconciled(record, data, details = {}, version) {
	if (!terminalState(record)) return record;
	return {
		...record,
		version,
		updatedAt: new Date().toISOString(),
		reconciliation: {
			state: "late_terminal",
			observedAt: details.observedAt || new Date().toISOString(),
			registrationKey: String(details.registrationKey || ""),
			data
		}
	};
}

function terminalState(record = {}) {
	return TERMINAL_STATES.has(record.state);
}

module.exports = {
	TERMINAL_STATES,
	reconciled,
	terminal,
	terminalState
};
