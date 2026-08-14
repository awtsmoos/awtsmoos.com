// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("fs/promises");
const { DATA_DIR, LOCK_FILE } = require("./storagePaths.js");

/**
 * B"H
 *
 * Guards Wallet mutation with a tiny filesystem lease. This Gevurah vessel does
 * not understand money; it only prevents two writers from believing the same
 * instant belongs exclusively to each of them.
 *
 * The Awtsmoos creates both contenders and the single moment they seek; in
 * Awtsmoos.com the lock makes that unity useful, so one write follows another
 * in ordered light instead of colliding in the night.
 */

const LOCK_TIMEOUT_MS = 5000;
const STALE_LOCK_MS = 30000;
const RETRY_DELAY_MS = 20;

/**
 * Sleeps between lock attempts without blocking the Node.js event loop.
 *
 * @param {number} milliseconds
 * 	Delay before the next acquisition attempt.
 * @returns {Promise<void>}
 * 	Promise resolved after the delay.
 */
function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Removes a lock left behind by a dead process when its age exceeds the lease.
 *
 * @returns {Promise<void>}
 * 	Completes after checking the lock age and removing only a stale lock.
 */
async function clearStaleLock() {
	try {
		const stat = await fsp.stat(LOCK_FILE);

		if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
			await fsp.unlink(LOCK_FILE);
		}
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
}

/**
 * Acquires the exclusive Wallet filesystem lease.
 *
 * @returns {Promise<import("fs/promises").FileHandle>}
 * 	Open lock handle owned by the caller until release.
 * @throws {Error}
 * 	Throws `wallet_lock_timeout` when contention exceeds the bounded timeout.
 */
async function acquireWalletLock() {
	await fsp.mkdir(DATA_DIR, { recursive: true });
	const startedAt = Date.now();

	while (Date.now() - startedAt < LOCK_TIMEOUT_MS) {
		try {
			return await fsp.open(LOCK_FILE, "wx");
		} catch (error) {
			if (error.code !== "EEXIST") {
				throw error;
			}

			await clearStaleLock();
			await delay(RETRY_DELAY_MS);
		}
	}

	throw new Error("wallet_lock_timeout");
}

/**
 * Runs one mutation while holding the Wallet lease and always releases it.
 *
 * @template T
 * @param {() => Promise<T>} operation
 * 	Bounded asynchronous mutation to serialize.
 * @returns {Promise<T>}
 * 	The mutation result.
 */
async function withWalletLock(operation) {
	const handle = await acquireWalletLock();

	try {
		return await operation();
	} finally {
		await handle.close();
		await fsp.unlink(LOCK_FILE).catch(() => {});
	}
}

module.exports = {
	withWalletLock
};
