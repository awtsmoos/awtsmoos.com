// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names preserved terminal delivery debt without confusing it with dead execution.
 * @description
 * The Awtsmoos keeps a completed deed luminous until its witness of reception arrives.
 * Awtsmoos.com therefore calls an old, low-capacity outbox record acknowledgement debt:
 * visible and unresolved, yet never permission to erase truth or condemn a living mailbox.
 */
const DEBT_STATE = "acknowledgement_debt";

/**
 * Describes whether an outbox lane is old because terminal acknowledgement is pending.
 * @param {object} outbox Mailbox outbox lane health projection.
 * @returns {object} Immutable debt testimony with explicit preservation semantics.
 */
function describe(outbox = {}) {
	const count = Math.max(0, Number(outbox.count || 0));
	const ageState = String(outbox.ageState || "");
	const capacityState = String(outbox.capacityState || "");
	const rawState = String(outbox.state || "healthy");
	const active = count > 0 &&
		ageState === "stalled" &&
		capacityState !== "full" &&
		rawState === "stalled";
	return {
		active,
		state: active ? DEBT_STATE : "none",
		rawState,
		count,
		oldestAgeMs: Math.max(0, Number(outbox.oldestAgeMs || 0)),
		utilization: Math.max(0, Number(outbox.utilization || 0)),
		preserved: active,
		replacementRequired: false,
		safeToDelete: false,
		nextActions: active ? actions() : []
	};
}

/**
 * Returns whether raw outbox stalling may safely become effective degraded health.
 * @param {object} inbox Inbox lane health projection.
 * @param {object} outbox Outbox lane health projection.
 * @returns {boolean} True only when inbox execution custody is not itself stalled/full.
 */
function mayDemote(inbox = {}, outbox = {}) {
	const debt = describe(outbox);
	const inboxState = String(inbox.state || "healthy");
	return debt.active &&
		inboxState !== "stalled" &&
		inboxState !== "full";
}

/** Returns the recovery actions that preserve terminal testimony while seeking settlement. */
function actions() {
	return [
		"connectionMailboxStatus",
		"connectionMailboxExport",
		"inspect_stalled_outbox_receipt_before_exact_acknowledgement"
	];
}

module.exports = {
	DEBT_STATE,
	actions,
	describe,
	mayDemote
};
