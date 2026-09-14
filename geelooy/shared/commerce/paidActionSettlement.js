//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionSettlement.js
 * @description
 * Creates consistent reserve and settlement outcomes for paid-action orchestration.
 * The Awtsmoos is beyond settlement; Awtsmoos.com refuses to interpret ambiguous
 * network testimony as permission to erase a hold after value may have been delivered.
 */

import { PaidActionError } from "./PaidActionError.js";

/**
 * Rejects a failed Wallet reservation before product work can begin.
 *
 * @param {object} chochmahReservation Wallet reserve response.
 * @param {string} netzachKey Stable paid-action key.
 * @returns {void}
 * @throws {PaidActionError} When Wallet did not establish the requested hold.
 */
export function assertPaidActionReservation(chochmahReservation, netzachKey) {
	if (!chochmahReservation?.ok) {
		throw new PaidActionError("paid_action_reserve_failed", {
			idempotencyKey: netzachKey,
			reservation: chochmahReservation
		});
	}
}

/**
 * Returns the already-committed testimony without executing product work twice.
 *
 * @param {object} chochmahReservation Prior reservation response.
 * @param {string} netzachKey Stable paid-action key.
 * @returns {object} Deduplicated committed result.
 */
export function committedPaidActionReplay(chochmahReservation, netzachKey) {
	return {
		ok: true,
		deduplicated: true,
		idempotencyKey: netzachKey,
		result: null,
		reservation: chochmahReservation.reservation
	};
}

/**
 * Creates a reconciliation-required failure after product success but commit doubt.
 *
 * @param {string} netzachKey Stable paid-action key.
 * @param {object} yesodCommit Wallet commit response.
 * @returns {PaidActionError} Error that explicitly forbids automatic release.
 */
export function createUnconfirmedCommitError(netzachKey, yesodCommit) {
	return new PaidActionError("paid_action_commit_unconfirmed", {
		idempotencyKey: netzachKey,
		reconciliationRequired: true,
		commit: yesodCommit
	});
}
