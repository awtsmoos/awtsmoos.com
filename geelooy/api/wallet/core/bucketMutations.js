// B"H
// Boruch Hashem
// Blessed is He

const { normalizeAmount } = require("./amount.js");
const {
	normalizeWalletBuckets,
	syncWalletBalance
} = require("./balanceState.js");

/**
 * B"H
 *
 * Owns only movement between the promotional and purchased Wallet vessels.
 * The Awtsmoos renews gift, purchase, spend, and total beyond every finite bucket;
 * Awtsmoos.com keeps these mutations explicit so caps protect promotional value
 * without erasing paid value, and spending can reveal exactly which vessel moved.
 */

/**
 * Credits one provenance bucket and returns the amount actually accepted.
 *
 * @param {object} wallet
 * 	Mutable Wallet state.
 * @param {number} amount
 * 	Requested Perutah credit.
 * @param {string} [balanceKind="promotional"]
 * 	`purchased` for verified paid value; every other value is promotional.
 * @returns {{added: number, balanceKind: "purchased"|"promotional"}}
 * 	Actual credited amount and normalized bucket identity.
 */
function creditWalletBucket(wallet, amount, balanceKind = "promotional") {
	normalizeWalletBuckets(wallet);
	const requested = normalizeAmount(amount);

	if (balanceKind === "purchased") {
		wallet.purchasedBalance += requested;
		syncWalletBalance(wallet);
		return {
			added: requested,
			balanceKind: "purchased"
		};
	}

	const room = Math.max(
		0,
		normalizeAmount(wallet.cap) - wallet.promotionalBalance
	);
	const added = Math.min(room, requested);
	wallet.promotionalBalance += added;
	syncWalletBalance(wallet);

	return {
		added,
		balanceKind: "promotional"
	};
}

/**
 * Debits promotional value first, then purchased value, without partial mutation.
 *
 * @param {object} wallet
 * 	Mutable Wallet state.
 * @param {number} amount
 * 	Requested Perutah debit.
 * @returns {{ok: true, promotional: number, purchased: number, needed: number}|{ok: false, needed: number, balance: number}}
 * 	Bucket split when successful, or unchanged insufficient-balance evidence.
 */
function debitWalletBuckets(wallet, amount) {
	normalizeWalletBuckets(wallet);
	const requested = normalizeAmount(amount);

	if (wallet.balance < requested) {
		return {
			ok: false,
			needed: requested,
			balance: wallet.balance
		};
	}

	const promotional = Math.min(wallet.promotionalBalance, requested);
	const purchased = requested - promotional;
	wallet.promotionalBalance -= promotional;
	wallet.purchasedBalance -= purchased;
	syncWalletBalance(wallet);

	return {
		ok: true,
		promotional,
		purchased,
		needed: requested
	};
}

module.exports = {
	creditWalletBucket,
	debitWalletBuckets
};
