//B"H
// Boruch Hashem
// Blessed is He

const PhasePolicy = require("./request-phase-policy.js");

/**
 * @file Observes expired exact custody without turning age into destructive authority.
 * @description
 * A parent-custody lease is a clock, never a verdict. Once the parent accepted a deed,
 * age alone cannot prove whether the deed waited, ran, completed, or lost an acknowledgement.
 * Awtsmoos.com therefore preserves ambiguous accepted custody for stronger living evidence,
 * while the Awtsmoos renews each instant without letting an old clock kill today's vessel.
 *
 * > When clocks grow old but witnesses hide,
 * > The deed stays whole on the guarded side;
 * > The Awtsmoos renews both vessel and tide,
 * > So only present proof may make process life divide.
 */

/**
 * Preserves every expired parent-custody record while withholding replacement authority.
 * @param {object} mailbox Live mailbox exposing durable custody evidence and a snapshot.
 * @param {object} [options] Observation controls and a caller-visible reason.
 * @returns {object} Bounded attention testimony that never redispatches or kills by age alone.
 */
function reconcile(mailbox, options = {}) {
	const observedAt = Number(options.now || Date.now());
	const evidence = mailbox.evidence(false);
	const records = Array.isArray(evidence.custody) ? evidence.custody : [];
	const expired = records.filter(record => PhasePolicy.expired(record, observedAt));
	const actions = expired.map(preserveExpiredCustody);
	const attentionRequired = actions.length > 0;

	return {
		ok: true,
		reason: String(options.reason || "semantic_reconcile"),
		observedAt,
		expired: expired.length,
		actions,
		attentionRequired,
		replacementRequired: false,
		safeToRedispatch: false,
		snapshot: mailbox.snapshot()
	};
}

/**
 * Converts one expired accepted record into non-destructive ambiguity testimony.
 * @param {object} record Exact parent-custody witness.
 * @returns {object} Preserved action carrying the strongest safe reason currently known.
 */
function preserveExpiredCustody(record = {}) {
	if (resultMustSurvive(record)) {
		return preserved(record, "result_waiting_for_ack");
	}
	if (!record.id) {
		return preserved(record, "missing_exact_custody_id");
	}
	return preserved(record, "accepted_execution_ambiguity");
}

/** Returns whether durable terminal/result testimony must remain available for ACK recovery. */
function resultMustSurvive(record = {}) {
	const phase = String(record.phase || "").toLowerCase();
	const resultState = String(record.resultState || "").toLowerCase();
	return phase === "result_waiting_for_ack" || phase === "result_ready" ||
		resultState.includes("waiting_for_ack") || resultState.includes("result_ready");
}

/** Builds one fail-closed custody action with redispatch explicitly forbidden. */
function preserved(record, reason) {
	return {
		id: record.id || null,
		phase: record.phase || null,
		operation: "preserved",
		reason,
		safeToRedispatch: false
	};
}

module.exports = {
	reconcile,
	preserveExpiredCustody,
	resultMustSurvive
};
