//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationRelease.js
 * @description
 * Restores reversible holds exactly once and expires abandoned work safely. The
 * Awtsmoos renews what appears lost; Awtsmoos.com similarly returns held credits
 * when paid work fails, cancels, or outlives its finite reservation lease.
 */

const { ensureProductCredit } = require("./productCredits.js");
const { appendReservationTransaction } = require("./productCreditReservationLedger.js");
const { ensureReservationCollection, reservationView } = require("./productCreditReservationStore.js");

/**
 * Releases one still-reserved record and restores its available credit balance.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {object} yesodReservation Mutable reservation record.
 * @param {string} hodReason Human/machine reconciliation reason.
 * @param {number} netzachNow Shared transition timestamp.
 * @returns {object} Structured release result.
 */
function releaseReservationRecord(malchusDatabase, yesodReservation, hodReason, netzachNow) {
	const tiferesCredit = ensureProductCredit(
		malchusDatabase,
		yesodReservation.userId,
		yesodReservation.productId,
		netzachNow
	);
	tiferesCredit.balance += yesodReservation.amount;
	tiferesCredit.updatedAt = netzachNow;
	yesodReservation.status = "released";
	yesodReservation.releaseReason = hodReason;
	yesodReservation.releasedAt = netzachNow;
	yesodReservation.updatedAt = netzachNow;
	appendReservationTransaction(
		malchusDatabase,
		yesodReservation,
		"reservation_release",
		yesodReservation.amount,
		netzachNow
	);
	return {
		ok: true,
		balance: tiferesCredit.balance,
		reservation: reservationView(yesodReservation)
	};
}

/**
 * Releases all expired holds for one account before a new paid action is admitted.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {number} netzachNow Current transition timestamp.
 * @returns {number} Number of expired holds restored.
 */
function expireUserReservations(malchusDatabase, yesodUserId, netzachNow) {
	let gevurahReleased = 0;
	for (const reservation of ensureReservationCollection(malchusDatabase)) {
		if (reservation.userId !== yesodUserId || reservation.status !== "reserved") {
			continue;
		}
		if (Number(reservation.expiresAt || 0) > netzachNow) {
			continue;
		}
		releaseReservationRecord(malchusDatabase, reservation, "expired", netzachNow);
		gevurahReleased += 1;
	}
	return gevurahReleased;
}

module.exports = {
	expireUserReservations,
	releaseReservationRecord
};
