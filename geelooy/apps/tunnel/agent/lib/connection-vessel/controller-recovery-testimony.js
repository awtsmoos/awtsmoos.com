// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
/**
 * @file Interprets bounded, incarnation-bound mailbox recovery testimony for supervision.
 * @description
 * The Awtsmoos lets evidence cross a process boundary without granting old testimony a sword.
 * Awtsmoos.com accepts only known semantic reasons spoken by the exact current incarnation,
 * so a delayed state frame cannot authorize repair of the child that replaced its author.
 */
const KNOWN_REASONS = new Set([
	"result_waiting_for_ack",
	"missing_exact_custody_id",
	"quarantine_failed",
	"semantic_recovery_ambiguous"
]);

/** Decides whether one state frame may authorize repair of its exact source incarnation. */
function fromState(state = {}, sourceChildIncarnationId = "") {
	const sourceIncarnation = Incarnation.clean(sourceChildIncarnationId);
	const stateIncarnation = Incarnation.clean(state.childIncarnationId);
	if (!Incarnation.matches(sourceIncarnation, stateIncarnation)) {
		return {
			required: false,
			reason: "",
			childIncarnationId: sourceIncarnation,
			incarnationMismatch: true
		};
	}
	const recovery = state.mailboxRecovery || {};
	if (recovery.replacementRequired !== true) {
		return {
			required: false,
			reason: "",
			childIncarnationId: sourceIncarnation,
			incarnationMismatch: false
		};
	}
	const semanticReason = String(recovery.reason || "").trim();
	const reason = KNOWN_REASONS.has(semanticReason)
		? semanticReason
		: "semantic_recovery_ambiguous";
	return {
		required: true,
		reason: `child_mailbox_${reason}`,
		childIncarnationId: sourceIncarnation,
		incarnationMismatch: false
	};
}

module.exports = { fromState };
