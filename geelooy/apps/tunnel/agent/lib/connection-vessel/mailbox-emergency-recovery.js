// B"H
// Boruch Hashem
// Blessed is He

const NativeRecovery = require("../runtime/priority/nativeGenerationRecovery.js");
const SemanticRecovery = require("./mailbox-semantic-recovery.js");
const Settlement = require("./mailbox-emergency-settlement.js");
const Telemetry = require("./mailbox-emergency-telemetry.js");

/**
 * @file Orchestrates exact mailbox recovery without sacrificing terminal testimony.
 * @description
 * The Awtsmoos distinguishes a lost path from a finished deed awaiting reception.
 * Awtsmoos.com quarantines proven pre-result debris, replaces ambiguous generations,
 * and preserves terminal ACK debt without mistaking its age for execution death.
 */
function scan(mailbox, reason = "periodic_stale_custody", source = "periodic") {
	try {
		const snapshot = mailbox.snapshot();
		Telemetry.scanned(snapshot, source);
		if (hasStaleInboxCustody(snapshot)) {
			return reconcile(mailbox, reason, source);
		}
		if (Settlement.hasStalledOutbox(snapshot)) {
			return Settlement.settlementRequired(snapshot, reason, source);
		}
		return null;
	} catch (error) {
		return failure(reason, source, error);
	}
}

/**
 * Runs semantic recovery and grants generation replacement only for real ambiguity.
 * @param {object} mailbox Live controller mailbox.
 * @param {string} reason Recovery trigger reason.
 * @param {string} source Recovery source label.
 * @returns {object} Recovery testimony with exact replacement authority.
 */
function reconcile(mailbox, reason = "p0_mailbox_reconcile", source = "manual") {
	try {
		const result = SemanticRecovery.reconcile(mailbox, { reason });
		const debt = Settlement.describe(mailbox.snapshot());
		if (Settlement.onlyAcknowledgementDebt(result, debt)) {
			result.replacementRequired = false;
			result.reconciliationState = Settlement.DEBT_STATE;
			result.acknowledgementDebt = debt;
		} else if (result.replacementRequired) {
			result.replacement = NativeRecovery.schedule(`mailbox:${reason}`);
		}
		Telemetry.recovered(reason, source, result);
		return result;
	} catch (error) {
		return failure(reason, source, error);
	}
}

/**
 * Quarantines one exact inbox receipt only when no terminal result must survive.
 * @param {object} mailbox Live controller mailbox.
 * @param {string} id Exact custody receipt identifier.
 * @returns {object} Quarantine, preservation, or bounded failure testimony.
 */
function quarantineExact(mailbox, id) {
	try {
		const record = mailbox.evidence(false).custody.find(item => item.id === id);
		if (record && SemanticRecovery.resultMustSurvive(record)) {
			return { ok: false, error: "result_waiting_for_ack_preserved", id };
		}
		const quarantined = mailbox.quarantineExact(id, "p0_exact_quarantine");
		const result = { ok: true, quarantined };
		Telemetry.recovered("p0_exact_quarantine", "manual", result);
		return result;
	} catch (error) {
		return failure("p0_exact_quarantine", "manual", error);
	}
}

/** Returns whether semantic recovery may inspect stale pre-result parent custody. */
function hasStaleInboxCustody(snapshot = {}) {
	return Number(snapshot.inbox?.parentCustodyStaleCount || 0) > 0;
}

/** Converts recovery exceptions into bounded testimony instead of parent crashes. */
function failure(reason, source, error) {
	Telemetry.failed(reason, source, error);
	return { ok: false, error: "mailbox_recovery_failed", reason: String(reason || "") };
}

module.exports = {
	failure,
	hasStaleInboxCustody,
	hasStalledOutbox: Settlement.hasStalledOutbox,
	onlyAcknowledgementDebt: Settlement.onlyAcknowledgementDebt,
	quarantineExact,
	reconcile,
	scan,
	settlementRequired: Settlement.settlementRequired
};
