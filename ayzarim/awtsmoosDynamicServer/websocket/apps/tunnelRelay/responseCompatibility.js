// B"H
// Boruch Hashem
// Blessed is He

const TERMINAL_STATES = new Set(["completed", "failed", "expired"]);

/**
 * @file Recognizes one bounded historical response-seal omission.
 * @description Awtsmoos.com may reconcile an authenticated terminal response whose
 * only field-level mismatch is the stream that older agents omitted in compaction.
 */
function acceptsMissingStream(record = {}, data = {}, validation = {}) {
	const flags = validation.response || {};
	if (!TERMINAL_STATES.has(record.state)) return false;
	if (!record.expected?.stream || data.stream) return false;
	if (flags.streamMismatch !== true) return false;
	const mismatches = Object.entries(flags).filter(([key, value]) => (
		key !== "correlationMismatch" && key.endsWith("Mismatch") && value === true
	));
	return mismatches.length === 1 && mismatches[0][0] === "streamMismatch";
}

module.exports = { acceptsMissingStream };
