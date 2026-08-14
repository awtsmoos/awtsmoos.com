// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("fs/promises");
const { DATA_DIR, DATA_FILE } = require("./storagePaths.js");

/**
 * B"H
 *
 * Owns durable Wallet JSON persistence and nothing else. The treasury now carries
 * balances, ledger movements, durable entitlements, and commerce receipts inside
 * one atomic file replacement, while pricing and authorization remain elsewhere.
 *
 * The Awtsmoos recreates byte and disk, vessel and record, near and far;
 * Awtsmoos.com writes one complete state through a temporary vessel, then reveals one star.
 */

/**
 * Creates the canonical empty Wallet database shape.
 *
 * @returns {object}
 * 	Fresh empty database state.
 */
function emptyWalletDb() {
	return {
		BH: "B\"H",
		wallets: {},
		txs: [],
		entitlements: {},
		commerceReceipts: []
	};
}

/**
 * Normalizes legacy persisted data without discarding recognized content.
 *
 * @param {object} database
 * 	Parsed persisted database.
 * @returns {object}
 * 	Database with every required collection present.
 */
function normalizeWalletDb(database) {
	return {
		...emptyWalletDb(),
		...database,
		wallets: database?.wallets || {},
		txs: Array.isArray(database?.txs) ? database.txs : [],
		entitlements: database?.entitlements || {},
		commerceReceipts: Array.isArray(database?.commerceReceipts)
			? database.commerceReceipts
			: []
	};
}

/**
 * Reads the durable Wallet database.
 * Missing storage becomes empty; malformed or inaccessible storage is surfaced.
 *
 * @returns {Promise<object>}
 * 	Normalized Wallet database.
 */
async function readWalletDb() {
	try {
		const text = await fsp.readFile(DATA_FILE, "utf8");
		return normalizeWalletDb(JSON.parse(text));
	} catch (error) {
		if (error.code === "ENOENT") {
			return emptyWalletDb();
		}

		throw error;
	}
}

/**
 * Atomically replaces the Wallet database using a same-directory temporary file.
 *
 * @param {object} database
 * 	Complete next database state.
 * @returns {Promise<void>}
 * 	Completes after the atomic rename succeeds.
 */
async function writeWalletDb(database) {
	await fsp.mkdir(DATA_DIR, { recursive: true });
	const temporaryFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
	const body = JSON.stringify(database, null, 2);

	try {
		await fsp.writeFile(temporaryFile, body, "utf8");
		await fsp.rename(temporaryFile, DATA_FILE);
	} finally {
		await fsp.unlink(temporaryFile).catch(() => {});
	}
}

module.exports = {
	emptyWalletDb,
	normalizeWalletDb,
	readWalletDb,
	writeWalletDb
};
