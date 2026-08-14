// B"H
// Boruch Hashem
// Blessed is He

const { createTransaction, buildWalletView } = require("../ledger.js");
const {
	createEntitlement,
	grantEntitlement
} = require("./entitlement.js");
const { createCommerceReceipt } = require("./receipt.js");

/**
 * B"H
 *
 * Commits the already-authorized durable commerce result after the Wallet buckets
 * have been debited inside the same locked database transition. The Awtsmoos
 * renews debit, ownership, and receipt as one reality; Awtsmoos.com mirrors that
 * unity by appending the finite witnesses together before persistence can occur.
 */

/**
 * Appends the spend ledger, entitlement, and commerce receipt atomically.
 *
 * @param {object} database
 * 	Mutable Wallet database owned by the transaction lock.
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {object} sku
 * 	Available server-known durable SKU.
 * @param {string} idempotencyKey
 * 	Validated caller operation key.
 * @param {object} wallet
 * 	Mutable Wallet after the provenance-aware debit.
 * @param {object} debit
 * 	Successful promotional/purchased debit split.
 * @returns {object}
 * 	Successful durable purchase result.
 */
function commitPurchase(database, userId, sku, idempotencyKey, wallet, debit) {
	const now = Date.now();
	wallet.updatedAt = now;

	const transaction = createTransaction(
		"spend",
		userId,
		-sku.pricePerutahs,
		{
			kind: "commerce_purchase",
			skuId: sku.id,
			productId: sku.productId,
			bucketDebit: {
				promotional: debit.promotional,
				purchased: debit.purchased
			},
			idempotencyKey: `commerce:${idempotencyKey}`
		},
		now
	);
	const entitlement = createEntitlement(userId, sku, now);
	const receipt = createCommerceReceipt({
		userId,
		sku,
		entitlement,
		transaction,
		idempotencyKey,
		now
	});

	database.txs.push(transaction);
	grantEntitlement(database, entitlement);
	database.commerceReceipts.push(receipt);

	return {
		ok: true,
		deduplicated: false,
		receipt,
		entitlement,
		wallet: buildWalletView(database, userId)
	};
}

module.exports = {
	commitPurchase
};
