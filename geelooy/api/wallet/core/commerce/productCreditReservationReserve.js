//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationReserve.js
 * @description
 * Creates one reversible credit hold before asynchronous paid work begins. The
 * Awtsmoos is beyond uncertainty; Awtsmoos.com nevertheless protects the user by
 * separating temporary capacity reservation from irreversible value consumption.
 */

const { ensureProductCredit } = require("./productCredits.js");
const { appendReservationTransaction } = require("./productCreditReservationLedger.js");
const { expireUserReservations } = require("./productCreditReservationRelease.js");
const {
	createReservation,
	ensureReservationCollection,
	findReservation,
	reservationView,
	sameReservation
} = require("./productCreditReservationStore.js");

/**
 * Reserves validated product credits atomically inside an existing Wallet lock.
 *
 * A replay of an active or committed reservation returns the original testimony.
 * A released key cannot be resurrected; callers must create a fresh action key.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {object} chochmahInput Validated product/amount/purpose/replay testimony.
 * @param {number} [netzachNow=Date.now()] Shared transition timestamp.
 * @returns {object} Reservation result with available balance after the hold.
 */
function reserveProductCredits(malchusDatabase, yesodUserId, chochmahInput, netzachNow = Date.now()) {
	expireUserReservations(malchusDatabase, yesodUserId, netzachNow);
	const prior = findReservation(malchusDatabase, yesodUserId, chochmahInput.idempotencyKey);
	const credit = ensureProductCredit(
		malchusDatabase,
		yesodUserId,
		chochmahInput.productId,
		netzachNow
	);
	if (prior && !sameReservation(prior, chochmahInput)) {
		return conflictResult(prior);
	}
	if (prior?.status === "released") {
		return releasedReplayResult(prior);
	}
	if (prior) {
		return {
			ok: true,
			deduplicated: true,
			balance: credit.balance,
			reservation: reservationView(prior)
		};
	}
	if (credit.balance < chochmahInput.amount) {
		return {
			ok: false,
			error: "insufficient_product_credits",
			balance: credit.balance
		};
	}
	credit.balance -= chochmahInput.amount;
	credit.updatedAt = netzachNow;
	const reservation = createReservation(yesodUserId, chochmahInput, netzachNow);
	ensureReservationCollection(malchusDatabase).push(reservation);
	appendReservationTransaction(
		malchusDatabase,
		reservation,
		"reservation_hold",
		-chochmahInput.amount,
		netzachNow
	);
	return {
		ok: true,
		deduplicated: false,
		balance: credit.balance,
		reservation: reservationView(reservation)
	};
}

/** @param {object} prior Existing conflicting reservation. @returns {object} */
function conflictResult(prior) {
	return {
		ok: false,
		error: "idempotency_conflict",
		reservation: reservationView(prior)
	};
}

/** @param {object} prior Released reservation. @returns {object} */
function releasedReplayResult(prior) {
	return {
		ok: false,
		error: prior.releaseReason === "expired"
			? "reservation_expired"
			: "reservation_already_released",
		reservation: reservationView(prior)
	};
}

module.exports = {
	reserveProductCredits
};
