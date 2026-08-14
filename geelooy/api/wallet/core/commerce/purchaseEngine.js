// B"H
// Boruch Hashem
// Blessed is He

const { transact } = require("../transactionRunner.js");
const { validatePurchaseRequest } = require("./purchaseValidation.js");
const { purchaseInsideTransaction } = require("./purchaseMutation.js");

/**
 * B"H
 *
 * Coordinates preflight validation with one locked commerce mutation. Validation
 * and mutation live in separate vessels so each remains small, testable, and clear.
 * The Awtsmoos renews intention and manifestation together; Awtsmoos.com crosses
 * from one to the other through a single explicit treasury boundary.
 */

/**
 * Purchases one server-known durable SKU atomically.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {object|null} sku
 * 	Server-known SKU definition.
 * @param {string} rawIdempotencyKey
 * 	Stable caller operation key.
 * @returns {Promise<object>}
 * 	Purchase result including receipt, entitlement, and Wallet view when successful.
 */
async function purchaseSku(userId, sku, rawIdempotencyKey) {
	const validation = validatePurchaseRequest(sku, rawIdempotencyKey);

	if (!validation.ok) {
		return validation;
	}

	return transact(database => purchaseInsideTransaction(
		database,
		userId,
		sku,
		validation.idempotencyKey
	));
}

module.exports = {
	purchaseSku
};
