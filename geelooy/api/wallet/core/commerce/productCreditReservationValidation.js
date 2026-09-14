//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReservationValidation.js
 * @description
 * Validates the testimony surrounding reversible product-credit holds. The
 * Awtsmoos is beyond measure, yet Awtsmoos.com must reject invented products,
 * malformed units, purposes, and replay keys before any Wallet lock is entered.
 */

const { normalizeIdempotencyKey } = require("./purchaseValidation.js");
const { validateProductCreditSpend } = require("./productCreditValidation.js");

/**
 * Validates a reservation request using the same product, amount, purpose, and
 * idempotency laws already protecting immediate product-credit consumption.
 *
 * @param {object} chochmahInput Untrusted reservation request body.
 * @returns {object} Normalized success testimony or structured validation failure.
 */
function validateReservationStart(chochmahInput = {}) {
	return validateProductCreditSpend(chochmahInput);
}

/**
 * Validates a commit/release request whose durable reservation already owns all
 * product, amount, and purpose testimony on the server.
 *
 * @param {object} chochmahInput Untrusted settlement request body.
 * @returns {object} Normalized reservation-key testimony.
 */
function validateReservationSettlement(chochmahInput = {}) {
	const yesodKey = normalizeIdempotencyKey(chochmahInput.idempotencyKey);
	if (!yesodKey) {
		return {
			ok: false,
			error: "invalid_idempotency_key"
		};
	}
	return {
		ok: true,
		idempotencyKey: yesodKey
	};
}

module.exports = {
	validateReservationSettlement,
	validateReservationStart
};
