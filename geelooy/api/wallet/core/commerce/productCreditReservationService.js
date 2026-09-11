//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationService.js
 * @description
 * Places reserve, commit, and release transitions behind the same serialized Wallet
 * lock used by every treasury mutation. The Awtsmoos renews all state as one;
 * Awtsmoos.com therefore persists each paid-action phase atomically and retry-safely.
 */

const { transact } = require("../transactionRunner.js");
const { commitProductCreditReservation } = require("./productCreditReservationCommit.js");
const { releaseReservationRecord } = require("./productCreditReservationRelease.js");
const { reserveProductCredits } = require("./productCreditReservationReserve.js");
const { findReservation, reservationView } = require("./productCreditReservationStore.js");
const {
	validateReservationSettlement,
	validateReservationStart
} = require("./productCreditReservationValidation.js");

/** @param {string} yesodUserId Account id. @param {object} chochmahInput Untrusted request. @returns {Promise<object>} */
async function reserveProductCreditsForAction(yesodUserId, chochmahInput = {}) {
	const validation = validateReservationStart(chochmahInput);
	if (!validation.ok) {
		return validation;
	}
	return transact(database => reserveProductCredits(database, yesodUserId, validation));
}

/** @param {string} yesodUserId Account id. @param {object} chochmahInput Untrusted request. @returns {Promise<object>} */
async function commitReservedProductCredits(yesodUserId, chochmahInput = {}) {
	const validation = validateReservationSettlement(chochmahInput);
	if (!validation.ok) {
		return validation;
	}
	return transact(database => {
		return commitProductCreditReservation(
			database,
			yesodUserId,
			validation.idempotencyKey
		);
	});
}

/** @param {string} yesodUserId Account id. @param {object} chochmahInput Untrusted request. @returns {Promise<object>} */
async function releaseReservedProductCredits(yesodUserId, chochmahInput = {}) {
	const validation = validateReservationSettlement(chochmahInput);
	if (!validation.ok) {
		return validation;
	}
	return transact(database => releaseByKey(database, yesodUserId, validation.idempotencyKey));
}

/** @param {object} database Locked database. @param {string} userId Account id. @param {string} key Reservation key. @returns {object} */
function releaseByKey(database, userId, key) {
	const reservation = findReservation(database, userId, key);
	if (!reservation) {
		return {
			ok: false,
			error: "unknown_reservation"
		};
	}
	if (reservation.status === "released") {
		return {
			ok: true,
			deduplicated: true,
			reservation: reservationView(reservation)
		};
	}
	if (reservation.status === "committed") {
		return {
			ok: false,
			error: "reservation_already_committed",
			reservation: reservationView(reservation)
		};
	}
	return releaseReservationRecord(database, reservation, "cancelled", Date.now());
}

module.exports = {
	commitReservedProductCredits,
	releaseReservedProductCredits,
	reserveProductCreditsForAction
};
