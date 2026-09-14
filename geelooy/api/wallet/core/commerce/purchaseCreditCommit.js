// B"H
// Boruch Hashem
// Blessed is He

const { createTransaction, buildWalletView } = require("../ledger.js");
const { debitForSku } = require("./purchaseDebit.js");
const { createCommerceReceipt } = require("./receipt.js");
const { grantProductCredits } = require("./productCredits.js");

/**
 * Atomically converts purchased Perutas into one product's consumable credits.
 * The caller already owns the Wallet lock and has validated SKU/idempotency shape.
 */
function commitCreditPackPurchase(database, userId, sku, idempotencyKey, wallet) {
	const debit = debitForSku(wallet, sku);
	if (!debit.ok) {
		return {
			ok: false,
			error: debit.spendPolicy === "purchased_only"
				? "insufficient_purchased_perutahs"
				: "insufficient_perutahs",
			balance: debit.balance,
			needed: debit.needed,
			spendPolicy: sku.spendPolicy
		};
	}
	const now = Date.now();
	wallet.updatedAt = now;
	const transaction = createTransaction("spend", userId, -sku.pricePerutahs, {
		kind: "commerce_credit_pack",
		skuId: sku.id,
		productId: sku.productId,
		creditUnits: sku.creditUnits,
		bucketDebit: { promotional: debit.promotional, purchased: debit.purchased },
		idempotencyKey: `commerce:${idempotencyKey}`
	}, now);
	const grant = grantProductCredits(database, userId, sku, now);
	const receipt = createCommerceReceipt({
		userId,
		sku,
		transaction,
		idempotencyKey,
		creditGrant: grant,
		now
	});
	database.txs.push(transaction);
	database.commerceReceipts.push(receipt);
	return {
		ok: true,
		deduplicated: false,
		receipt,
		productCredit: grant.state,
		wallet: buildWalletView(database, userId)
	};
}

module.exports = {
	commitCreditPackPurchase
};
