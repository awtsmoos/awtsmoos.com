// B"H
// Boruch Hashem
// Blessed is He

const Presentation = require("./terminalPresentation.js");

/**
 * @file Chooses effective deed truth without erasing earlier transport history.
 * @description
 * The Awtsmoos keeps one deed beneath changing clocks and sockets; Awtsmoos.com
 * remembers the caller's earlier timeout while allowing later authenticated native
 * testimony to become operational truth. Raw durable evidence remains untouched,
 * while only the observer-facing copy receives semantic presentation and history.
 */

/**
 * Returns whether a durable relay record carries verified late native testimony.
 * @param {object} record Durable relay record.
 * @returns {boolean} True when a validated late terminal result was persisted.
 */
function hasLateTerminal(record = {}) {
	return record.reconciliation?.state === "late_terminal" &&
		record.reconciliation.data !== undefined;
}

/**
 * Returns the terminal state future callers should observe.
 * @param {object} record Durable relay record.
 * @returns {string} Effective completed, failed, expired, or stored state.
 */
function effectiveState(record = {}) {
	if (!hasLateTerminal(record)) return String(record.state || "");
	return record.reconciliation.data?.ok === false ? "failed" : "completed";
}

/**
 * Returns observer-facing terminal data while preserving raw durable storage.
 * @param {object} record Durable relay record with expectation and reconciliation data.
 * @returns {*} Presented original result or promoted authenticated late native result.
 */
function effectiveData(record = {}) {
	const raw = hasLateTerminal(record)
		? promotedLateData(record)
		: record.data;
	return Presentation.decorate(record.expected || {}, raw);
}

/**
 * Builds a copy of verified late native data carrying the earlier relay observation.
 * @param {object} record Durable relay record.
 * @returns {*} Promoted late result, preserving non-object values unchanged.
 */
function promotedLateData(record = {}) {
	const lateData = record.reconciliation.data;
	if (!lateData || typeof lateData !== "object" || Array.isArray(lateData)) {
		return lateData;
	}
	return {
		...lateData,
		reconciliation: {
			state: "late_terminal_promoted",
			observedAt: record.reconciliation.observedAt || null,
			originalState: record.state || null,
			originalData: record.data ?? null
		}
	};
}

module.exports = {
	effectiveData,
	effectiveState,
	hasLateTerminal,
	promotedLateData
};
