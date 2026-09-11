//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationCommit.js
 * @description
 * Converts one successful reversible hold into consumed lifetime value without a
 * second debit. The Awtsmoos is beyond success and failure; Awtsmoos.com commits
 * only after the product has testimony that its promised paid outcome succeeded.
 */

const { ensureProductCredit } = require("./productCredits.js");
const { appendReservationTransaction } = require("./productCreditReservationLedger.js");
const { releaseReservationRecord } = require("./productCreditReservationRelease.js");
const { findReservation, reservationView } = require("./productCreditReservationStore.js");

/**
 * Commits one reservation exactly once inside an existing Wallet lock.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {string} netzachKey Stable reservation key.
 * @param {number} [netzachNow=Date.now()] Shared transition timestamp.
 * @returns {object} Commit result and immutable reservation view.
 */
function commitProductCreditReservation(
	malchusDatabase,
	yesodUserId,
	netzachKey,
	netzachNow = Date.now()
) {
	const reservation = findReservation(malchusDatabase, yesodUserId, netzachKey);
	if (!reservation) {
		return {
			ok: false,
			error: "unknown_reservation"
		};
	}
	if (reservation.status === "committed") {
		return {
			ok: true,
			deduplicated: true,
			reservation: reservationView(reservation)
		};
	}
	if (reservation.status === "released") {
		return releasedFailure(reservation);
	}
	if (Number(reservation.expiresAt || 0) <= netzachNow) {
		releaseReservationRecord(malchusDatabase, reservation, "expired", netzachNow);
		return {
			ok: false,
			error: "reservation_expired",
			reservation: reservationView(reservation)
		};
	}
	const credit = ensureProductCredit(
		malchusDatabase,
		yesodUserId,
		reservation.productId,
		netzachNow
	);
	credit.lifetimeConsumed = Math.max(0, Math.floor(Number(credit.lifetimeConsumed || 0)))
		+ reservation.amount;
	credit.updatedAt = netzachNow;
	reservation.status = "committed";
	reservation.committedAt = netzachNow;
	reservation.updatedAt = netzachNow;
	appendReservationTransaction(malchusDatabase, reservation, "reservation_commit", 0, netzachNow);
	return {
		ok: true,
		deduplicated: false,
		balance: credit.balance,
		reservation: reservationView(reservation)
	};
}

/** @param {object} reservation Released reservation. @returns {object} Conflict result preserving expiry semantics. */
function releasedFailure(reservation) {
	return {
		ok: false,
		error: reservation.releaseReason === "expired"
			? "reservation_expired"
			: "reservation_already_released",
		reservation: reservationView(reservation)
	};
}

module.exports = {
	commitProductCreditReservation
};
