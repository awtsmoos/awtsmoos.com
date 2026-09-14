//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationLedger.js
 * @description
 * Records reservation lifecycle movements without polluting direct-consume replay
 * keys. The Awtsmoos is beyond debit and return; Awtsmoos.com keeps every finite
 * hold, commit, and release independently traceable for support and reconciliation.
 */

const crypto = require("crypto");

/**
 * Appends one reservation lifecycle transaction to the product-credit ledger.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {object} yesodReservation Durable reservation testimony.
 * @param {string} hodKind Reservation lifecycle event kind.
 * @param {number} gevurahDelta Available-balance movement caused by the event.
 * @param {number} netzachNow Shared transition timestamp.
 * @returns {Readonly<object>} Immutable appended transaction.
 */
function appendReservationTransaction(
	malchusDatabase,
	yesodReservation,
	hodKind,
	gevurahDelta,
	netzachNow
) {
	const transaction = Object.freeze({
		id: `credit_${crypto.randomBytes(8).toString("hex")}`,
		userId: yesodReservation.userId,
		productId: yesodReservation.productId,
		delta: gevurahDelta,
		kind: hodKind,
		purpose: yesodReservation.purpose,
		reservationId: yesodReservation.id,
		reservationKey: yesodReservation.idempotencyKey,
		at: netzachNow
	});
	if (!Array.isArray(malchusDatabase.productCreditTxs)) {
		malchusDatabase.productCreditTxs = [];
	}
	malchusDatabase.productCreditTxs.push(transaction);
	return transaction;
}

module.exports = {
	appendReservationTransaction
};
