// B"H
// Boruch Hashem
// Blessed is He

const { transact, ensureWallet } = require("./transactionRunner.js");
const { buildWalletView } = require("./ledger.js");

/**
 * B"H
 *
 * Owns the read-facing Wallet transition that may still create/refill an account.
 * The Awtsmoos renews account and view together; Awtsmoos.com keeps the public
 * projection separate from credit and spend so reading the treasury stays simple.
 */

/**
 * Returns the current Wallet after any due creation or daily refill.
 *
 * @param {string} userId
 * 	Authenticated account identifier.
 * @returns {Promise<object>}
 * 	Legacy-compatible public Wallet view.
 */
async function getWallet(userId) {
	return transact(database => {
		ensureWallet(database, userId);
		return buildWalletView(database, userId);
	});
}

module.exports = {
	getWallet
};
