//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecutionReplay.js
 * @description
 * Resolves retries against durable paid-action execution history. The Awtsmoos is
 * beyond sequence; Awtsmoos.com nevertheless remembers each finite action key so
 * success cannot execute twice, running work cannot overlap itself, and released
 * reservations cannot be resurrected by a browser replay.
 */

const { findReservation } = require("./productCreditReservationStore.js");
const {
	paidActionExecutionView,
	samePaidActionExecution
} = require("./paidActionExecutionStore.js");

/**
 * Resolves one prior execution without re-running fulfillment.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {object} tiferesPrior Existing execution record.
 * @param {object} chochmahValidation Current server-validated action testimony.
 * @param {number} netzachNow Shared transition timestamp.
 * @returns {object} Stable retry testimony.
 */
function resolvePaidActionReplay(
	malchusDatabase,
	yesodUserId,
	tiferesPrior,
	chochmahValidation,
	netzachNow
) {
	if (!samePaidActionExecution(tiferesPrior, chochmahValidation)) {
		return replayFailure("idempotency_conflict", tiferesPrior);
	}
	markReleasedRunningExecution(
		malchusDatabase,
		yesodUserId,
		tiferesPrior,
		chochmahValidation.idempotencyKey,
		netzachNow
	);
	if (tiferesPrior.status === "succeeded") {
		return {
			ok: true,
			deduplicated: true,
			execute: false,
			execution: paidActionExecutionView(tiferesPrior)
		};
	}
	if (tiferesPrior.status === "running") {
		return replayFailure("paid_action_in_progress", tiferesPrior);
	}
	return replayFailure(
		tiferesPrior.error || "paid_action_execution_finalized",
		tiferesPrior
	);
}

/**
 * Converts an execution whose reservation was already released into terminal failure.
 *
 * @param {object} database Locked Wallet database.
 * @param {string} userId Authenticated account id.
 * @param {object} execution Mutable execution record.
 * @param {string} key Stable action key.
 * @param {number} now Shared timestamp.
 * @returns {void}
 */
function markReleasedRunningExecution(database, userId, execution, key, now) {
	if (execution.status !== "running") {
		return;
	}
	const reservation = findReservation(database, userId, key);
	if (reservation?.status !== "released") {
		return;
	}
	execution.status = "failed";
	execution.error = reservation.releaseReason === "expired"
		? "reservation_expired"
		: "reservation_already_released";
	execution.updatedAt = now;
}

/** @param {string} gevurahError Stable error code. @param {object} execution Existing record. @returns {object} */
function replayFailure(gevurahError, execution) {
	return {
		ok: false,
		error: gevurahError,
		execution: paidActionExecutionView(execution)
	};
}

module.exports = {
	resolvePaidActionReplay
};
