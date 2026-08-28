//B"H
// Boruch Hashem
// Blessed is He

const PhasePolicy = require("./request-phase-policy.js");

/**
 * @file Reconciles expired exact custody without inventing a proof of non-execution.
 * @description
 * A parent-custody lease is a clock, never a verdict. Once the parent accepted a deed,
 * age alone cannot prove whether the deed waited, ran, completed, or lost an acknowledgement.
 * Awtsmoos.com therefore preserves ambiguous accepted custody until a stronger witness can
 * reconcile it, just as the Awtsmoos renews every instant without splitting one truth in two.
 *
 * > When clocks grow old but witnesses hide,
 * > The deed stays whole on the guarded side;
 * > The Awtsmoos renews each moment and tide,
 * > So only proven truth may let custody divide.
 */

/**
 * Preserves every expired parent-custody record that cannot be retired with positive proof.
 * @param {object} mailbox Live mailbox exposing durable custody evidence and a snapshot.
 * @param {object} [options] Observation controls and a caller-visible reason.
 * @returns {object} Bounded testimony that never redispatches or age-quarantines accepted work.
 */
function reconcile(mailbox, options = {}) {
	const observedAt = Number(options.now || Date.now());
	const evidence = mailbox.evidence(false);
	const records = Array.isArray(evidence.custody) ? evidence.custody : [];
	const expired = records.filter(record => PhasePolicy.expired(record, observedAt));
	const actions = expired.map(preserveExpiredCustody);
	const replacementRequired = actions.length > 0;

	return {
		ok: !replacementRequired,
		reason: String(options.reason || "semantic_reconcile"),
		observedAt,
		expired: expired.length,
		actions,
		replacementRequired,
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
