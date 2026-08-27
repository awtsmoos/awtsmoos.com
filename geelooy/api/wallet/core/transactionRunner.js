// B"H
// Boruch Hashem
// Blessed is He

const { withWalletLock } = require("./fileLock.js");
const { readWalletDb, writeWalletDb } = require("./persistence.js");
const {
	DEFAULT_START,
	createWallet,
	normalizeWallet,
	applyDailyRefill
} = require("./walletModel.js");
const { createTransaction } = require("./ledger.js");

/**
 * B"H
 *
 * Owns the serialized Wallet database boundary and account/refill transition.
 * Legacy balances are normalized into explicit provenance buckets before any
 * mutation, while fresh welcome value enters the promotional vessel explicitly.
 *
 * The Awtsmoos renews old state and new state from one source; Awtsmoos.com keeps
 * the migration lossless so accounting becomes clearer without rewriting history.
 */

/**
 * Ensures a Wallet exists, migrates legacy shape, and applies at most one refill.
 *
 * @param {object} database
 * 	Mutable database owned by the active Wallet lock.
 * @param {string} userId
 * 	Authenticated account identifier.
 * @param {number} [now=Date.now()]
 * 	Shared transition timestamp.
 * @returns {object}
 * 	Mutable normalized account Wallet.
 */
function ensureWallet(database, userId, now = Date.now()) {
	if (!database.wallets[userId]) {
		database.wallets[userId] = createWallet(userId, now);
		database.txs.push(createTransaction(
			"welcome_grant",
			userId,
			DEFAULT_START,
			{ balanceKind: "promotional" },
			now
		));
	}

	const wallet = normalizeWallet(database.wallets[userId]);
	const refill = applyDailyRefill(wallet, now);

	if (refill.added > 0) {
		database.txs.push(createTransaction(
			"daily_refill",
			userId,
			refill.added,
			{ balanceKind: "promotional" },
			now
		));
	}

	return wallet;
}

/**
 * Runs one complete Wallet database transition behind the cross-process lock.
 *
 * @template T
 * @param {(database: object) => Promise<T>|T} operation
 * 	State transition performed against the locked database.
 * @returns {Promise<T>}
 * 	Operation result after atomic durable persistence.
 */
async function transact(operation) {
	return withWalletLock(async () => {
		const database = await readWalletDb();
		const result = await operation(database);
		await writeWalletDb(database);
		return result;
	});
}

module.exports = {
	ensureWallet,
	transact
};
