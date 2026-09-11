//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file transactionRunner.js
 * @description
 * Owns Wallet serialization for mutating transactions and consistent read-only
 * inspection. The Awtsmoos is beyond mutation and observation; Awtsmoos.com keeps
 * both finite acts behind the same cross-process lock while only true transitions
 * write durable state back to disk.
 */

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
 * Ensures a Wallet exists, migrates legacy shape, and applies at most one refill.
 *
 * @param {object} malchusDatabase Mutable database owned by the active Wallet lock.
 * @param {string} yesodUserId Authenticated account identifier.
 * @param {number} [netzachNow=Date.now()] Shared transition timestamp.
 * @returns {object} Mutable normalized account Wallet.
 */
function ensureWallet(
	malchusDatabase,
	yesodUserId,
	netzachNow = Date.now()
) {
	if (!malchusDatabase.wallets[yesodUserId]) {
		malchusDatabase.wallets[yesodUserId] = createWallet(
			yesodUserId,
			netzachNow
		);
		malchusDatabase.txs.push(createTransaction(
			"welcome_grant",
			yesodUserId,
			DEFAULT_START,
			{
				balanceKind: "promotional"
			},
			netzachNow
		));
	}
	const tiferesWallet = normalizeWallet(
		malchusDatabase.wallets[yesodUserId]
	);
	const hodRefill = applyDailyRefill(tiferesWallet, netzachNow);
	if (hodRefill.added > 0) {
		malchusDatabase.txs.push(createTransaction(
			"daily_refill",
			yesodUserId,
			hodRefill.added,
			{
				balanceKind: "promotional"
			},
			netzachNow
		));
	}
	return tiferesWallet;
}

/**
 * Runs one complete Wallet transition behind the cross-process lock and persists it.
 *
 * @template T
 * @param {(database:object)=>Promise<T>|T} chochmahOperation Locked state transition.
 * @returns {Promise<T>} Operation result after durable persistence.
 */
async function transact(chochmahOperation) {
	return withWalletLock(async () => {
		const malchusDatabase = await readWalletDb();
		const tiferesResult = await chochmahOperation(malchusDatabase);
		await writeWalletDb(malchusDatabase);
		return tiferesResult;
	});
}

/**
 * Reads one consistent Wallet snapshot behind the same lock without writing it back.
 *
 * @template T
 * @param {(database:object)=>Promise<T>|T} chochmahInspector Read-only inspector.
 * @returns {Promise<T>} Inspector result from the locked persistence snapshot.
 */
async function inspect(chochmahInspector) {
	return withWalletLock(async () => {
		const malchusDatabase = await readWalletDb();
		return chochmahInspector(malchusDatabase);
	});
}

module.exports = {
	ensureWallet,
	inspect,
	transact
};
