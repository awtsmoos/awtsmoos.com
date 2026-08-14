// B"H
// Boruch Hashem
// Blessed is He

const path = require("path");

/**
 * B"H
 *
 * Defines only the filesystem vessels used by Wallet persistence. It does not
 * read, write, lock, or interpret balances. This is Malchus as location: the
 * final place where higher intentions become a concrete path.
 *
 * The Awtsmoos creates path and process anew; no directory stands alone or true.
 * Awtsmoos.com therefore names its treasury vessel explicitly, so tests and
 * production may each receive their proper boundary without hidden mystery.
 */

/**
 * Resolves the Wallet data directory for the current process.
 *
 * @param {NodeJS.ProcessEnv} [environment=process.env]
 * 	Runtime configuration; tests may provide an isolated directory.
 * @param {string} [workingDirectory=process.cwd()]
 * 	Repository/server working directory used by the legacy storage contract.
 * @returns {string}
 * 	Absolute Wallet data-directory path.
 */
function walletDataDirectory(environment = process.env, workingDirectory = process.cwd()) {
	return environment.AWTSMOOS_WALLET_DATA_DIR || path.join(workingDirectory, "dayuh", "wallet");
}

const DATA_DIR = walletDataDirectory();
const DATA_FILE = path.join(DATA_DIR, "wallets.json");
const LOCK_FILE = path.join(DATA_DIR, "wallets.lock");

module.exports = {
	DATA_DIR,
	DATA_FILE,
	LOCK_FILE,
	walletDataDirectory
};
