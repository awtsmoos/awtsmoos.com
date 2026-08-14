// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const {
	decompose,
	formatDenominations,
	perutahsToUsd
} = require("./currency.js");
const { normalizeWalletBuckets } = require("./balanceBuckets.js");

/**
 * B"H
 *
 * Owns Wallet ledger records, idempotency lookup, and public projection. The
 * Awtsmoos renews cause, bucket, denomination, and witness beyond every finite
 * account; Awtsmoos.com preserves exact Perutahs while adding compact historical
 * display strings that never replace the atomic ledger or bucket provenance.
 */

function createTransaction(type, userId, amount, meta = {}, now = Date.now()) {
	return Object.freeze({
		id: "tx_" + crypto.randomBytes(8).toString("hex"),
		type,
		userId,
		amount,
		meta: { ...meta },
		at: now
	});
}

function findIdempotentTransaction(transactions, userId, idempotencyKey) {
	if (!idempotencyKey) {
		return null;
	}
	return transactions.find((transaction) => {
		return transaction.userId === userId
			&& transaction.meta?.idempotencyKey === idempotencyKey;
	}) || null;
}

/**
 * Builds one backwards-compatible Wallet response plus compact display testimony.
 *
 * @param {object} database Current Wallet database.
 * @param {string} userId Account whose Wallet should be projected.
 * @returns {object} Public Wallet view.
 */
function buildWalletView(database, userId) {
	const wallet = normalizeWalletBuckets(database.wallets[userId]);
	return {
		...wallet,
		usdValue: perutahsToUsd(wallet.balance),
		coins: decompose(wallet.balance),
		display: {
			total: formatDenominations(wallet.balance),
			promotional: formatDenominations(wallet.promotionalBalance),
			purchased: formatDenominations(wallet.purchasedBalance)
		},
		recent: recentTransactions(database.txs, userId)
	};
}

function recentTransactions(transactions, userId) {
	return transactions
		.filter((transaction) => transaction.userId === userId)
		.slice(-25)
		.reverse();
}

module.exports = {
	createTransaction,
	findIdempotentTransaction,
	buildWalletView
};
