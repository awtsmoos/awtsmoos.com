// B"H
// Boruch Hashem
// Blessed is He

const { normalizeAmount } = require("./amount.js");
const { creditWalletBucket } = require("./balanceBuckets.js");
const { transact, ensureWallet } = require("./transactionRunner.js");
const {
	createTransaction,
	findIdempotentTransaction,
	buildWalletView
} = require("./ledger.js");

/**
 * B"H
 *
 * Owns Wallet credit transitions with explicit value provenance. Verified paid
 * value enters the purchased bucket; every other credit defaults to promotional
 * and therefore respects the promotional cap.
 *
 * The Awtsmoos renews gift, purchase, giver, and receiver beyond accounting;
 * Awtsmoos.com records finite provenance so generosity cannot masquerade as cash.
 */

/**
 * Credits Wallet value once for a stable operation key.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {number} amount
 * 	Requested Perutahs to add.
 * @param {string|null} idempotencyKey
 * 	Stable operation key or null for legacy non-idempotent credit.
 * @param {object} [meta={}]
 * 	Transaction provenance, including optional `balanceKind: "purchased"`.
 * @returns {Promise<object>}
 * 	Credit receipt with actual credited amount and Wallet view.
 */
async function creditOnce(userId, amount, idempotencyKey, meta = {}) {
	return transact(database => {
		const wallet = ensureWallet(database, userId);
		const existing = findIdempotentTransaction(database.txs, userId, idempotencyKey);

		if (existing) {
			return {
				ok: true,
				deduplicated: true,
				transaction: existing,
				wallet: buildWalletView(database, userId)
			};
		}

		const requested = normalizeAmount(amount);
		const bucketResult = creditWalletBucket(
			wallet,
			requested,
			meta.balanceKind
		);
		wallet.updatedAt = Date.now();
		const transaction = createTransaction("credit", userId, bucketResult.added, {
			...meta,
			balanceKind: bucketResult.balanceKind,
			requestedAmount: requested,
			...(idempotencyKey ? { idempotencyKey } : {})
		});
		database.txs.push(transaction);

		return {
			ok: true,
			deduplicated: false,
			transaction,
			wallet: buildWalletView(database, userId)
		};
	});
}

/**
 * Preserves the legacy credit contract for existing internal callers.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {number} amount
 * 	Requested Perutahs to add.
 * @param {object} [meta={}]
 * 	Transaction provenance.
 * @returns {Promise<object>}
 * 	Wallet view after the actual accepted credit.
 */
async function credit(userId, amount, meta = {}) {
	const result = await creditOnce(userId, amount, null, meta);
	return result.wallet;
}

module.exports = {
	credit,
	creditOnce
};
