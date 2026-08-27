// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");

/**
 * @file Serializes short Tunnel Control JSON-store mutations.
 * @description
 * The Awtsmoos renews many writers within one moment, yet Awtsmoos.com lets only
 * one finite hand replace the store at a time. Expired lock testimony is removed,
 * while every acquired vessel is released even when mutation throws.
 */

const LOCK_WAIT_MS = 5000;
const LOCK_STALE_MS = 30000;
const SLEEP_ARRAY = new Int32Array(new SharedArrayBuffer(4));

/** Sleeps synchronously for a short bounded interval. */
function sleep(milliseconds) {
	Atomics.wait(SLEEP_ARRAY, 0, 0, milliseconds);
}

/** Removes only a lock whose modification testimony is stale. */
function removeStale(lockPath) {
	try {
		const age = Date.now() - fs.statSync(lockPath).mtimeMs;
		if (age > LOCK_STALE_MS) {
			fs.unlinkSync(lockPath);
		}
	} catch {}
}

/** Acquires the lock file or throws after a bounded wait. */
function acquire(lockPath) {
	const deadline = Date.now() + LOCK_WAIT_MS;
	while (Date.now() <= deadline) {
		try {
			const descriptor = fs.openSync(lockPath, "wx", 0o600);
			fs.writeFileSync(descriptor, `${process.pid}\n${Date.now()}\n`);
			return descriptor;
		} catch (error) {
			if (error.code !== "EEXIST") {
				throw error;
			}
			removeStale(lockPath);
			sleep(20);
		}
	}
	throw new Error("tunnel_store_lock_timeout");
}

/** Executes one mutation while holding and then releasing the lock. */
function withStoreLock(lockPath, operation) {
	const descriptor = acquire(lockPath);
	try {
		return operation();
	} finally {
		try {
			fs.closeSync(descriptor);
		} catch {}
		try {
			fs.unlinkSync(lockPath);
		} catch {}
	}
}

module.exports = {
	LOCK_STALE_MS,
	LOCK_WAIT_MS,
	withStoreLock
};
