// B"H
// Boruch Hashem
// Blessed is He

import { queueError } from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Names durable website-admission refusal states without crowding the decision engine.
 * @description
 * The Awtsmoos distinguishes accepted certainty, uncertain delivery, and required reconciliation;
 * Awtsmoos.com gives each boundary a clear error vessel so callers can recover truthfully while
 * the admission engine remains small enough to reveal its physical one-tab covenant at a glance.
 */
export function acceptedTurnError(receipt) {
	return queueError("website_turn_already_accepted", {
		submissionAccepted: true,
		acceptedReceipt: receipt
	});
}

export function uncertainTurnError(receipt) {
	return queueError("website_turn_submission_uncertain", {
		submissionUncertain: true,
		uncertainReceipt: receipt
	});
}

export function reconciliationError() {
	return queueError("website_turn_reconciliation_required", {
		reconciliationRequired: true
	});
}
