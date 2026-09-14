//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PaidActionCoordinator.js
 * @description
 * Coordinates reserve → execute → commit/release without letting network ambiguity
 * erase value. The Awtsmoos is beyond success and failure; Awtsmoos.com therefore
 * holds credits reversibly until product work reveals which finite outcome occurred.
 */

import { PaidActionError } from "./PaidActionError.js";
import {
	commitPaidAction,
	createPaidActionKey,
	releasePaidAction,
	reservePaidAction
} from "./paidActionClient.js";
import {
	assertPaidActionReservation,
	committedPaidActionReplay,
	createUnconfirmedCommitError
} from "./paidActionSettlement.js";

/**
 * Orchestrates reversible Wallet capacity around one asynchronous product action.
 */
export class PaidActionCoordinator {
	/**
	 * @param {object} [netzachTransport] Injectable Wallet transport for tests/products.
	 */
	constructor(netzachTransport = {}) {
		this.reserve = netzachTransport.reserve || reservePaidAction;
		this.commit = netzachTransport.commit || commitPaidAction;
		this.release = netzachTransport.release || releasePaidAction;
		this.createKey = netzachTransport.createKey || createPaidActionKey;
	}

	/**
	 * Runs one paid action while preserving credit safety through every failure phase.
	 *
	 * @param {object} chochmahAction Paid-action declaration.
	 * @param {string} chochmahAction.actionId Server-known paid capability identity.
	 * The server, never this browser coordinator, owns product, purpose, and credit cost.
	 * @param {string} [chochmahAction.idempotencyKey] Existing stable retry key.
	 * @param {() => Promise<unknown>} chochmahAction.execute Product work callback.
	 * @returns {Promise<object>} Product result plus settled reservation testimony.
	 */
	async run(chochmahAction) {
		const netzachKey = chochmahAction.idempotencyKey
			|| this.createKey(chochmahAction.actionId);
		const binahReservation = await this.reserve({
			actionId: chochmahAction.actionId,
			idempotencyKey: netzachKey
		});
		assertPaidActionReservation(binahReservation, netzachKey);
		if (binahReservation.reservation?.status === "committed") {
			return committedPaidActionReplay(binahReservation, netzachKey);
		}
		const malchusResult = await this.executeWithRelease(
			chochmahAction.execute,
			netzachKey
		);
		const yesodCommit = await this.commit(netzachKey);
		if (!yesodCommit.ok) {
			throw createUnconfirmedCommitError(netzachKey, yesodCommit);
		}
		return {
			ok: true,
			idempotencyKey: netzachKey,
			result: malchusResult,
			reservation: yesodCommit.reservation
		};
	}

	/**
	 * Executes product work and releases only when execution itself demonstrably fails.
	 *
	 * @param {() => Promise<unknown>} tiferesExecute Product callback.
	 * @param {string} netzachKey Stable paid-action key.
	 * @returns {Promise<unknown>} Successful product result.
	 */
	async executeWithRelease(tiferesExecute, netzachKey) {
		try {
			return await tiferesExecute();
		} catch (error) {
			const yesodRelease = await this.release(netzachKey);
			throw new PaidActionError("paid_action_execution_failed", {
				idempotencyKey: netzachKey,
				releasePending: !yesodRelease.ok,
				release: yesodRelease,
				cause: String(error?.message || error)
			});
		}
	}
}
