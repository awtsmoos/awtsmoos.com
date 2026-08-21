// B"H
// Boruch Hashem
// Blessed is He

const PhasePolicy = require("./request-phase-policy.js");

/**
 * @file Reconciles expired exact custody without ever replaying an accepted mutation.
 * @description
 * The Awtsmoos distinguishes stale execution custody from a durable result awaiting its
 * witness of reception. Awtsmoos.com quarantines only pre-result stale receipts, preserves
 * results waiting for ACK, and marks ambiguity for generation replacement instead of guesswork.
 */
function reconcile(mailbox, options = {}) {
	const observedAt = Number(options.now || Date.now());
	const evidence = mailbox.evidence(false);
	const records = evidence.custody || [];
	const expired = records.filter(record => PhasePolicy.expired(record, observedAt));
	const actions = [];
	let replacementRequired = false;

	for (const record of expired) {
		if (resultMustSurvive(record)) {
			actions.push(preserved(record, "result_waiting_for_ack"));
			replacementRequired = true;
			continue;
		}
		if (!record.id) {
			actions.push(preserved(record, "missing_exact_custody_id"));
			replacementRequired = true;
			continue;
		}
		try {
			const quarantine = mailbox.quarantineExact(record.id,
				`expired_${String(record.phase || "unknown")}`);
			actions.push({ id: record.id, phase: record.phase, operation: "quarantined",
				safeToRedispatch: false, quarantine });
		} catch (error) {
			actions.push({ id: record.id, phase: record.phase, operation: "quarantine_failed",
				error: String(error?.message || error), safeToRedispatch: false });
			replacementRequired = true;
		}
	}

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

function resultMustSurvive(record = {}) {
	const phase = String(record.phase || "").toLowerCase();
	const resultState = String(record.resultState || "").toLowerCase();
	return phase === "result_waiting_for_ack" || phase === "result_ready" ||
		resultState.includes("waiting_for_ack") || resultState.includes("result_ready");
}

function preserved(record, reason) {
	return {
		id: record.id || null,
		phase: record.phase || null,
		operation: "preserved",
		reason,
		safeToRedispatch: false
	};
}

module.exports = { reconcile, resultMustSurvive };
