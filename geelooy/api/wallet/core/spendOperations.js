// B"H
// Boruch Hashem
// Blessed is He

const { debitWalletBuckets } = require("./balanceBuckets.js");
const { transact, ensureWallet } = require("./transactionRunner.js");
const {
	createTransaction,
	findIdempotentTransaction,
	buildWalletView
} = require("./ledger.js");

/**
 * B"H
 *
 * Owns guarded Wallet debit transitions across explicit promotional and purchased
 * provenance buckets. Promotional value is consumed first, preserving paid value
 * whenever free/rewarded balance can satisfy the purchase.
 *
 * The Awtsmoos renews cost, balance, and receipt beyond all finite buckets;
 * Awtsmoos.com records the split so one total never hides where spent value came from.
 */

/**
 * Spends Perutahs once for a stable operation key.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {number} amount
 * 	Perutahs to debit.
 * @param {string|null} idempotencyKey
 * 	Stable operation key or null for the legacy spend contract.
 * @param {object} [meta={}]
 * 	Transaction provenance.
 * @returns {Promise<object>}
 * 	Debit result, deduplication state, and Wallet view when successful.
 */
async function spendOnce(userId, amount, idempotencyKey, meta = {}) {
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

		const debit = debitWalletBuckets(wallet, amount);

		if (!debit.ok) {
			return {
				ok: false,
				error: "insufficient_perutahs",
				balance: debit.balance,
				needed: debit.needed
			};
		}

		wallet.updatedAt = Date.now();
		const transaction = createTransaction("spend", userId, -debit.needed, {
			...meta,
			bucketDebit: {
				promotional: debit.promotional,
				purchased: debit.purchased
			},
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
 * Preserves the legacy spend result contract for existing callers.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {number} amount
 * 	Perutahs to debit.
 * @param {object} [meta={}]
 * 	Transaction provenance.
 * @returns {Promise<object>}
 * 	Legacy success/error result.
 */
async function spend(userId, amount, meta = {}) {
	const result = await spendOnce(userId, amount, null, meta);

	if (!result.ok) {
		return result;
	}

	return {
		ok: true,
		wallet: result.wallet
	};
}

module.exports = {
	spend,
	spendOnce
};
