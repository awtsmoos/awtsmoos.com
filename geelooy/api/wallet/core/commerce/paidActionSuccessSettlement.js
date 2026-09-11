//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionSuccessSettlement.js
 * @description
 * Settles successful paid actions inside the Wallet lock. The Awtsmoos is beyond
 * consumption and ownership; Awtsmoos.com nevertheless joins finite credit commit
 * and permanent entitlement grant into one transaction so neither can exist alone.
 */

const { getPaidAction } = require("./paidActionCatalog.js");
const {
	findPaidActionEntitlement,
	grantPaidActionEntitlement,
	paidActionEntitlementView
} = require("./paidActionEntitlement.js");
const { paidActionExecutionView } = require("./paidActionExecutionStore.js");
const { commitProductCreditReservation } = require("./productCreditReservationCommit.js");
const { releaseReservationRecord } = require("./productCreditReservationRelease.js");
const { findReservation } = require("./productCreditReservationStore.js");

/**
 * Commits one successful execution and grants durable ownership when required.
 *
 * A second concurrent permanent unlock releases its still-held reservation instead
 * of consuming credits after another execution has already granted the entitlement.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {object} tiferesExecution Mutable execution record.
 * @param {object} hodResult Normalized bounded fulfillment result.
 * @param {number} netzachNow Shared settlement timestamp.
 * @returns {object} Successful or stable failure testimony.
 */
function settleSuccessfulPaidAction(
	malchusDatabase,
	yesodUserId,
	tiferesExecution,
	hodResult,
	netzachNow
) {
	const chochmahAction = getPaidAction(tiferesExecution.actionId);
	const existing = chochmahAction
		? findPaidActionEntitlement(malchusDatabase, yesodUserId, chochmahAction)
		: null;
	if (existing) {
		return settleAlreadyOwned(
			malchusDatabase,
			tiferesExecution,
			hodResult,
			existing,
			netzachNow
		);
	}
	const gevurahCommit = commitProductCreditReservation(
		malchusDatabase,
		yesodUserId,
		tiferesExecution.idempotencyKey,
		netzachNow
	);
	if (!gevurahCommit.ok) {
		return markSettlementFailure(tiferesExecution, gevurahCommit.error, netzachNow);
	}
	const malchusEntitlement = chochmahAction
		? grantPaidActionEntitlement(malchusDatabase, yesodUserId, chochmahAction, netzachNow)
		: null;
	markExecutionSucceeded(tiferesExecution, hodResult, netzachNow);
	return {
		ok: true,
		balance: gevurahCommit.balance,
		reservation: gevurahCommit.reservation,
		entitlement: paidActionEntitlementView(malchusEntitlement),
		execution: paidActionExecutionView(tiferesExecution)
	};
}

/** @param {object} database Locked database. @param {object} execution Execution. @param {object} result Result. @param {object} entitlement Existing ownership. @param {number} now Timestamp. @returns {object} */
function settleAlreadyOwned(database, execution, result, entitlement, now) {
	const reservation = findReservation(database, execution.userId, execution.idempotencyKey);
	if (reservation?.status === "reserved") {
		releaseReservationRecord(database, reservation, "already_owned", now);
	}
	markExecutionSucceeded(execution, result, now);
	return {
		ok: true,
		deduplicated: true,
		alreadyOwned: true,
		entitlement: paidActionEntitlementView(entitlement),
		execution: paidActionExecutionView(execution)
	};
}

/** @param {object} execution Mutable execution. @param {object} result Normalized result. @param {number} now Timestamp. @returns {void} */
function markExecutionSucceeded(execution, result, now) {
	execution.status = "succeeded";
	execution.result = result;
	execution.error = null;
	execution.updatedAt = now;
}

/** @param {object} execution Mutable execution. @param {string} error Error code. @param {number} now Timestamp. @returns {object} */
function markSettlementFailure(execution, error, now) {
	execution.status = "failed";
	execution.error = error;
	execution.updatedAt = now;
	return {
		ok: false,
		error,
		execution: paidActionExecutionView(execution)
	};
}

module.exports = {
	settleSuccessfulPaidAction
};
