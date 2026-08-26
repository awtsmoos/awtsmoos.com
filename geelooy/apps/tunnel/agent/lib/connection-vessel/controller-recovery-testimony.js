// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Interprets bounded child mailbox recovery testimony for parent supervision.
 * @description
 * The Awtsmoos lets evidence cross a process boundary without granting arbitrary text
 * the power of repair. Awtsmoos.com accepts only explicit replacement testimony and
 * translates known semantic reasons into a finite exact-child supervisor vocabulary.
 */
const KNOWN_REASONS = new Set([
	"result_waiting_for_ack",
	"missing_exact_custody_id",
	"quarantine_failed",
	"semantic_recovery_ambiguous"
]);

/**
 * Reads one mirrored child state and decides whether exact-child repair is authorized.
 * @param {object} state Child connection state received over IPC.
 * @returns {{required:boolean, reason:string}} Bounded parent repair testimony.
 */
function fromState(state = {}) {
	const recovery = state.mailboxRecovery || {};
	if (recovery.replacementRequired !== true) {
		return { required: false, reason: "" };
	}
	const semanticReason = String(recovery.reason || "").trim();
	const reason = KNOWN_REASONS.has(semanticReason)
		? semanticReason
		: "semantic_recovery_ambiguous";
	return {
		required: true,
		reason: `child_mailbox_${reason}`
	};
}

module.exports = { fromState };
