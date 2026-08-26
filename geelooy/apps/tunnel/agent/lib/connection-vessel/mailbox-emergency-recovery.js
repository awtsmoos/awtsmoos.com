// B"H
// Boruch Hashem
// Blessed is He

const NativeRecovery = require("../runtime/priority/nativeGenerationRecovery.js");
const SemanticRecovery = require("./mailbox-semantic-recovery.js");
const Telemetry = require("./mailbox-emergency-telemetry.js");

/**
 * @file Executes semantic mailbox recovery against an explicitly supplied live mailbox.
 * @description
 * The Awtsmoos separates the healer's deed from the registry that owns the living
 * vessel. Awtsmoos.com can therefore test semantic recovery directly while preserving
 * exact-once custody, replacement escalation, and bounded failure testimony.
 */

/**
 * Scans one mailbox and recovers only when stale parent custody is present.
 * @param {object} mailbox Live controller mailbox.
 * @param {string} reason Recovery trigger reason.
 * @param {string} source Recovery source label.
 * @returns {object|null} Recovery result, failure testimony, or null when no work exists.
 */
function scan(mailbox, reason = "periodic_stale_custody", source = "periodic") {
	try {
		const snapshot = mailbox.snapshot();
		Telemetry.scanned(snapshot, source);
		if (Number(snapshot.inbox?.parentCustodyStaleCount || 0) < 1) return null;
		return reconcile(mailbox, reason, source);
	} catch (error) {
		return failure(reason, source, error);
	}
}

/**
 * Runs semantic recovery and schedules generation replacement only for ambiguity.
 * @param {object} mailbox Live controller mailbox.
 * @param {string} reason Recovery trigger reason.
 * @param {string} source Recovery source label.
 * @returns {object} Semantic recovery testimony.
 */
function reconcile(mailbox, reason = "p0_mailbox_reconcile", source = "manual") {
	try {
		const result = SemanticRecovery.reconcile(mailbox, { reason });
		if (result.replacementRequired) {
			result.replacement = NativeRecovery.schedule(`mailbox:${reason}`);
		}
		Telemetry.recovered(reason, source, result);
		return result;
	} catch (error) {
		return failure(reason, source, error);
	}
}

/**
 * Quarantines one exact receipt only when no terminal result must survive.
 * @param {object} mailbox Live controller mailbox.
 * @param {string} id Exact custody receipt identifier.
 * @returns {object} Quarantine, preservation, or bounded failure testimony.
 */
function quarantineExact(mailbox, id) {
	try {
		const record = mailbox.evidence(false).custody.find(item => item.id === id);
		if (record && SemanticRecovery.resultMustSurvive(record)) {
			return {
				ok: false,
				error: "result_waiting_for_ack_preserved",
				id
			};
		}
		const quarantined = mailbox.quarantineExact(id, "p0_exact_quarantine");
		const result = { ok: true, quarantined };
		Telemetry.recovered("p0_exact_quarantine", "manual", result);
		return result;
	} catch (error) {
		return failure("p0_exact_quarantine", "manual", error);
	}
}

/**
 * Converts any recovery exception into bounded testimony instead of a parent crash.
 * @param {string} reason Recovery reason.
 * @param {string} source Recovery source.
 * @param {Error} error Thrown recovery error.
 * @returns {object} Stable failure result.
 */
function failure(reason, source, error) {
	Telemetry.failed(reason, source, error);
	return {
		ok: false,
		error: "mailbox_recovery_failed",
		reason: String(reason || "")
	};
}

module.exports = {
	failure,
	quarantineExact,
	reconcile,
	scan
};
