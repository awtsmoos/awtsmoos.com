// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Chooses the effective deed outcome without erasing earlier transport history.
 * @description
 * The Awtsmoos keeps one deed beneath changing clocks and sockets. Awtsmoos.com
 * remembers that a caller once timed out, yet when the authenticated native vessel
 * later proves the exact terminal side effect, that verified result becomes the
 * operational truth returned to future observers.
 */

/**
 * Returns whether one terminal record carries verified late native testimony.
 *
 * @param {object} record Durable relay record.
 * @returns {boolean} True when a validated late terminal result was persisted.
 */
function hasLateTerminal(record = {}) {
	return record.reconciliation?.state === "late_terminal" &&
		record.reconciliation.data !== undefined;
}

/**
 * Returns the outcome state future callers should observe.
 *
 * The original record state remains untouched on disk so transport history is
 * auditable. A late authenticated result, however, outranks a prior timeout or
 * relay failure when answering whether the native deed actually completed.
 *
 * @param {object} record Durable relay record.
 * @returns {string} Effective terminal state.
 */
function effectiveState(record = {}) {
	if (!hasLateTerminal(record)) return String(record.state || "");
	return record.reconciliation.data?.ok === false ? "failed" : "completed";
}

/**
 * Returns the effective result while carrying the earlier terminal observation.
 *
 * @param {object} record Durable relay record.
 * @returns {*} Original result or promoted late native result.
 */
function effectiveData(record = {}) {
	if (!hasLateTerminal(record)) return record.data;
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
	hasLateTerminal
};
