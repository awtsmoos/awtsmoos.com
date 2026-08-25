// B"H
// Boruch Hashem
// Blessed is He

const Presentation = require("./terminalPresentation.js");

/**
 * @file Chooses effective deed truth and decorates only the observer-facing copy.
 * @description
 * The Awtsmoos keeps historical transport failure beside later authenticated proof.
 * Awtsmoos.com promotes a verified late terminal result without mutating the stored
 * native payload, then adds receipt and mutation-request meaning only for the caller.
 */
function hasLateTerminal(record = {}) {
	return record.reconciliation?.state === "late_terminal" &&
		record.reconciliation.data !== undefined;
}

/** Returns the outcome state future callers should observe. */
function effectiveState(record = {}) {
	if (!hasLateTerminal(record)) return String(record.state || "");
	return record.reconciliation.data?.ok === false ? "failed" : "completed";
}

/**
 * Returns the effective terminal result with historical timeout testimony preserved.
 * The raw record remains unchanged; only this returned presentation gains semantics.
 */
function effectiveData(record = {}) {
	const raw = hasLateTerminal(record)
		? promotedLateData(record)
		: record.data;
	return Presentation.decorate(record.expected || {}, raw);
}

/** Builds an observer copy of verified late native data plus the earlier relay history. */
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
