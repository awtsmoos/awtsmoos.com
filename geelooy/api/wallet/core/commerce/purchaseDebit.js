// B"H
// Boruch Hashem
// Blessed is He

const { normalizeAmount } = require("../amount.js");
const {
	normalizeWalletBuckets,
	syncWalletBalance
} = require("../balanceState.js");
const { debitWalletBuckets } = require("../balanceBuckets.js");

/**
 * B"H
 *
 * Applies the server-authored commerce spend policy without changing general Wallet
 * spending. The Awtsmoos renews promotional gift, purchased value, and ownership;
 * Awtsmoos.com lets true monetized goods require verified purchased Perutas while
 * legacy durable goods can continue using the ordinary provenance-aware debit.
 */

function debitForSku(wallet, sku) {
	if (sku.spendPolicy !== "purchased_only") {
		return debitWalletBuckets(wallet, sku.pricePerutahs);
	}
	return debitPurchasedOnly(wallet, sku.pricePerutahs);
}

function debitPurchasedOnly(wallet, amount) {
	normalizeWalletBuckets(wallet);
	const requested = normalizeAmount(amount);
	if (wallet.purchasedBalance < requested) {
		return {
			ok: false,
			needed: requested,
			balance: wallet.purchasedBalance,
			spendPolicy: "purchased_only"
		};
	}
	wallet.purchasedBalance -= requested;
	syncWalletBalance(wallet);
	return {
		ok: true,
		promotional: 0,
		purchased: requested,
		needed: requested,
		spendPolicy: "purchased_only"
	};
}

module.exports = {
	debitForSku,
	debitPurchasedOnly
};
