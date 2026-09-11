//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionFailureSettlement.js
 * @description
 * Restores a reserved hold when server fulfillment fails and seals the execution as
 * failed. The Awtsmoos is beyond loss and restoration; Awtsmoos.com nevertheless
 * returns finite customer value whenever promised paid work does not complete.
 */

const { releaseReservationRecord } = require("./productCreditReservationRelease.js");
const { findReservation } = require("./productCreditReservationStore.js");
const {
	findPaidActionExecution,
	paidActionExecutionView
} = require("./paidActionExecutionStore.js");

/**
 * Releases a failed fulfillment hold and marks the execution terminal.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {string} netzachKey Stable action key.
 * @param {string} gevurahError Stable public failure code.
 * @param {number} [netzachNow=Date.now()] Shared settlement timestamp.
 * @returns {object} Failure testimony after best-effort value restoration.
 */
function failPaidActionExecution(
	malchusDatabase,
	yesodUserId,
	netzachKey,
	gevurahError,
	netzachNow = Date.now()
) {
	const execution = findPaidActionExecution(malchusDatabase, yesodUserId, netzachKey);
	if (!execution) {
		return failure("unknown_paid_action_execution");
	}
	if (execution.status === "succeeded") {
		return failure("paid_action_already_succeeded");
	}
	const reservation = findReservation(malchusDatabase, yesodUserId, netzachKey);
	if (reservation?.status === "reserved") {
		releaseReservationRecord(
			malchusDatabase,
			reservation,
			"fulfillment_failed",
			netzachNow
		);
	}
	execution.status = "failed";
	execution.error = stablePaidActionError(gevurahError);
	execution.updatedAt = netzachNow;
	return {
		ok: false,
		error: execution.error,
		execution: paidActionExecutionView(execution)
	};
}

/** @param {object} chochmahResult Handler result. @returns {string} Stable failure code. */
function paidActionHandlerFailureCode(chochmahResult) {
	return stablePaidActionError(
		chochmahResult?.error || "paid_action_fulfillment_failed"
	);
}

/** @param {unknown} chochmahValue Error-like testimony. @returns {string} */
function stablePaidActionError(chochmahValue) {
	const yesodCode = String(chochmahValue || "").trim().toLowerCase();
	return /^[a-z0-9][a-z0-9._:-]{0,79}$/.test(yesodCode)
		? yesodCode
		: "paid_action_fulfillment_failed";
}

/** @param {string} gevurahError Error code. @returns {{ok:false,error:string}} */
function failure(gevurahError) {
	return {
		ok: false,
		error: gevurahError
	};
}

module.exports = {
	failPaidActionExecution,
	paidActionHandlerFailureCode,
	stablePaidActionError
};
