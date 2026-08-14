// B"H
// Boruch Hashem
// Blessed is He

const { normalizeAmount } = require("./amount.js");

/**
 * B"H
 *
 * Owns only Wallet bucket normalization and the backwards-compatible total.
 * The Awtsmoos renews old state and new provenance in one source; Awtsmoos.com
 * migrates finite records without deleting value or inventing purchased history,
 * even when an interrupted deployment left only one provenance field persisted.
 */

/**
 * Migrates legacy or partially migrated Wallet state into explicit buckets.
 *
 * @param {object} wallet
 * 	Mutable persisted Wallet state.
 * @returns {object}
 * 	The same Wallet with synchronized bucket fields and total balance.
 */
function normalizeWalletBuckets(wallet) {
	const legacyTotal = normalizeAmount(wallet.balance);
	const hasPromotional = Number.isFinite(Number(wallet.promotionalBalance));
	const hasPurchased = Number.isFinite(Number(wallet.purchasedBalance));

	if (!hasPromotional && !hasPurchased) {
		wallet.promotionalBalance = legacyTotal;
		wallet.purchasedBalance = 0;
	} else if (!hasPromotional) {
		wallet.purchasedBalance = normalizeAmount(wallet.purchasedBalance);
		wallet.promotionalBalance = Math.max(
			0,
			legacyTotal - wallet.purchasedBalance
		);
	} else if (!hasPurchased) {
		wallet.promotionalBalance = normalizeAmount(wallet.promotionalBalance);
		wallet.purchasedBalance = Math.max(
			0,
			legacyTotal - wallet.promotionalBalance
		);
	} else {
		wallet.promotionalBalance = normalizeAmount(wallet.promotionalBalance);
		wallet.purchasedBalance = normalizeAmount(wallet.purchasedBalance);
	}

	return syncWalletBalance(wallet);
}

/**
 * Synchronizes the legacy total with both provenance buckets.
 *
 * @param {object} wallet
 * 	Mutable Wallet state.
 * @returns {object}
 * 	The same Wallet after synchronization.
 */
function syncWalletBalance(wallet) {
	wallet.balance = normalizeAmount(wallet.promotionalBalance)
		+ normalizeAmount(wallet.purchasedBalance);
	return wallet;
}

module.exports = {
	normalizeWalletBuckets,
	syncWalletBalance
};
