// B"H
// Boruch Hashem
// Blessed is He

const Debt = require("./mailbox-acknowledgement-debt.js");

/**
 * @file Shapes preserved terminal settlement testimony for emergency mailbox recovery.
 * @description
 * The Awtsmoos keeps the finished deed while the witness of receipt is concealed.
 * Awtsmoos.com gives that waiting light its own vessel, so recovery orchestration can
 * remain small and cannot accidentally confuse acknowledgement debt with lost work.
 */

/**
 * Describes acknowledgement debt from a complete mailbox snapshot.
 * @param {object} snapshot Mailbox snapshot containing an outbox lane.
 * @returns {object} Exact debt testimony from the outbox projection.
 */
function describe(snapshot = {}) {
	return Debt.describe(snapshot.outbox);
}

/**
 * Returns whether preserved terminal acknowledgement debt is presently stale.
 * @param {object} snapshot Mailbox snapshot.
 * @returns {boolean} True only for old non-full terminal outbox debt.
 */
function hasStalledOutbox(snapshot = {}) {
	return describe(snapshot).active;
}

/**
 * Returns true only when every semantic action preserves a result waiting for ACK.
 * @param {object} result Semantic recovery result.
 * @param {object} debt Acknowledgement-debt description.
 * @returns {boolean} Whether generation replacement would be needless and destructive.
 */
function onlyAcknowledgementDebt(result = {}, debt = {}) {
	const actions = Array.isArray(result.actions) ? result.actions : [];
	return debt.active && actions.length > 0 && actions.every(action => {
		return action?.reason === "result_waiting_for_ack";
	});
}

/**
 * Builds compatibility-preserving settlement testimony without deleting terminal data.
 * @param {object} snapshot Mailbox snapshot.
 * @param {string} reason Recovery trigger reason.
 * @param {string} source Recovery source label.
 * @returns {object} Unresolved-but-preserved acknowledgement debt envelope.
 */
function settlementRequired(snapshot = {}, reason = "", source = "") {
	const acknowledgementDebt = describe(snapshot);
	return {
		ok: false,
		state: "outbox_settlement_required",
		reasonCode: Debt.DEBT_STATE,
		healthState: "degraded",
		reason,
		source,
		preserved: true,
		replacementRequired: false,
		acknowledgementDebt,
		outbox: {
			count: Number(snapshot.outbox?.count || 0),
			oldestAgeMs: Number(snapshot.outbox?.oldestAgeMs || 0)
		},
		nextAction: "inspect_stalled_outbox_receipt_before_exact_acknowledgement"
	};
}

module.exports = {
	DEBT_STATE: Debt.DEBT_STATE,
	describe,
	hasStalledOutbox,
	onlyAcknowledgementDebt,
	settlementRequired
};
