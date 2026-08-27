// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * B"H
 *
 * Shapes immutable commerce receipts after one atomic debit-and-grant transition.
 * The Awtsmoos renews price, purchaser, and granted vessel at every instant;
 * Awtsmoos.com preserves a finite witness so support, retries, and future audits
 * can point to one exact commercial event without guessing from balance alone.
 */

/**
 * Creates one durable commerce receipt.
 *
 * @param {object} input
 * 	Receipt facts created by the purchase engine.
 * @param {string} input.userId
 * 	Authenticated purchaser.
 * @param {object} input.sku
 * 	Server-known SKU.
 * @param {object} input.entitlement
 * 	Durable entitlement granted atomically.
 * @param {object} input.transaction
 * 	Wallet spend transaction created atomically.
 * @param {string} input.idempotencyKey
 * 	Stable caller operation key.
 * @param {number} [input.now=Date.now()]
 * 	Receipt timestamp.
 * @returns {object}
 * 	Immutable receipt record.
 */
function createCommerceReceipt(input) {
	return Object.freeze({
		id: "receipt_" + crypto.randomBytes(8).toString("hex"),
		userId: input.userId,
		skuId: input.sku.id,
		productId: input.sku.productId,
		pricePerutahs: input.sku.pricePerutahs,
		entitlementId: input.entitlement.id,
		transactionId: input.transaction.id,
		idempotencyKey: input.idempotencyKey,
		at: input.now ?? Date.now()
	});
}

/**
 * Finds an earlier commerce receipt for the same account operation key.
 *
 * @param {object} database
 * 	Wallet database state.
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {string} idempotencyKey
 * 	Stable caller operation key.
 * @returns {object|null}
 * 	Existing receipt or null.
 */
function findCommerceReceipt(database, userId, idempotencyKey) {
	return database.commerceReceipts.find(receipt => {
		return receipt.userId === userId && receipt.idempotencyKey === idempotencyKey;
	}) || null;
}

module.exports = {
	createCommerceReceipt,
	findCommerceReceipt
};
