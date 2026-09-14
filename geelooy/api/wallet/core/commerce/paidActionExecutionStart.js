//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecutionStart.js
 * @description
 * Begins exactly-once paid work by honoring execution history, durable ownership,
 * and server-priced credit reservation in that order. The Awtsmoos is beyond time
 * and possession; Awtsmoos.com nevertheless gives every finite action one coherent
 * doorway where retries cannot re-run success and ownership cannot be bought twice.
 */

const { getPaidAction } = require("./paidActionCatalog.js");
const {
	findPaidActionEntitlement,
	paidActionEntitlementView
} = require("./paidActionEntitlement.js");
const { resolvePaidActionReplay } = require("./paidActionExecutionReplay.js");
const {
	createPaidActionExecution,
	ensureExecutionCollection,
	findPaidActionExecution,
	paidActionExecutionView
} = require("./paidActionExecutionStore.js");
const { expireUserReservations } = require("./productCreditReservationRelease.js");
const { reserveProductCredits } = require("./productCreditReservationReserve.js");
const { validateProductCreditSpend } = require("./productCreditValidation.js");

/**
 * Begins one paid action inside the serialized Wallet transaction lock.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {object} chochmahInput Untrusted browser request.
 * @param {number} [netzachNow=Date.now()] Shared transition timestamp.
 * @returns {object} Start testimony indicating whether fulfillment should execute.
 */
function startPaidActionExecution(
	malchusDatabase,
	yesodUserId,
	chochmahInput = {},
	netzachNow = Date.now()
) {
	const gevurahValidation = validateProductCreditSpend(chochmahInput);
	if (!gevurahValidation.ok) {
		return gevurahValidation;
	}
	expireUserReservations(malchusDatabase, yesodUserId, netzachNow);
	const prior = findPaidActionExecution(
		malchusDatabase,
		yesodUserId,
		gevurahValidation.idempotencyKey
	);
	if (prior) {
		return resolvePaidActionReplay(
			malchusDatabase,
			yesodUserId,
			prior,
			gevurahValidation,
			netzachNow
		);
	}
	const chochmahAction = getPaidAction(gevurahValidation.actionId);
	const existingEntitlement = chochmahAction
		? findPaidActionEntitlement(malchusDatabase, yesodUserId, chochmahAction)
		: null;
	if (existingEntitlement) {
		return alreadyOwnedResult(existingEntitlement);
	}
	return beginFreshExecution(
		malchusDatabase,
		yesodUserId,
		gevurahValidation,
		netzachNow
	);
}

/**
 * Creates the reversible hold and durable execution record for brand-new paid work.
 *
 * @param {object} database Locked Wallet database.
 * @param {string} userId Authenticated account id.
 * @param {object} input Server-validated paid action testimony.
 * @param {number} now Shared transition timestamp.
 * @returns {object} Fresh execution start testimony.
 */
function beginFreshExecution(database, userId, input, now) {
	const reservation = reserveProductCredits(database, userId, input, now);
	if (!reservation.ok) {
		return reservation;
	}
	const execution = createPaidActionExecution(userId, input, now);
	ensureExecutionCollection(database).push(execution);
	return {
		ok: true,
		deduplicated: false,
		execute: true,
		execution: paidActionExecutionView(execution),
		reservation: reservation.reservation
	};
}

/** @param {object} entitlement Existing permanent ownership. @returns {object} */
function alreadyOwnedResult(entitlement) {
	return {
		ok: true,
		deduplicated: true,
		alreadyOwned: true,
		execute: false,
		entitlement: paidActionEntitlementView(entitlement)
	};
}

module.exports = {
	startPaidActionExecution
};
