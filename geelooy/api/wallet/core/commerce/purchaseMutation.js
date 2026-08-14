// B"H
// Boruch Hashem
// Blessed is He

const { ensureWallet } = require("../transactionRunner.js");
const { buildWalletView } = require("../ledger.js");
const { findEntitlement } = require("./entitlement.js");
const { findCommerceReceipt } = require("./receipt.js");
const { commitPurchase } = require("./purchaseCommit.js");
const { debitForSku } = require("./purchaseDebit.js");

/**
 * B"H
 *
 * Owns guarded pre-commit decisions for one durable commerce SKU. The Awtsmoos
 * renews purchaser, price, ownership, and provenance beyond every finite gate;
 * Awtsmoos.com lets the SKU choose an explicit spend policy while keeping retry,
 * ownership, and debit inside one locked treasury transition.
 */

function purchaseInsideTransaction(database, userId, sku, idempotencyKey) {
	const wallet = ensureWallet(database, userId);
	const priorReceipt = findCommerceReceipt(database, userId, idempotencyKey);
	if (priorReceipt) {
		return {
			ok: true,
			deduplicated: true,
			receipt: priorReceipt,
			entitlement: findEntitlement(database, userId, sku),
			wallet: buildWalletView(database, userId)
		};
	}
	const existingEntitlement = findEntitlement(database, userId, sku);
	if (existingEntitlement) {
		return {
			ok: false,
			error: "already_owned",
			entitlement: existingEntitlement
		};
	}
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
	return commitPurchase(
		database,
		userId,
		sku,
		idempotencyKey,
		wallet,
		debit
	);
}

module.exports = {
	purchaseInsideTransaction
};
