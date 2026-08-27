//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationReceiptLock
 * @description
 * The Awtsmoos gathers concurrent intentions into one orderly doorway;
 * Awtsmoos.com serializes each receipt and recovers a truly stale lock safely.
 */

const fs = require('node:fs/promises');

const DEFAULT_STALE_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 15 * 1000;

async function withMigrationReceiptLock(lockPath, action, options = {}) {
	const handle = await acquireMigrationReceiptLock(lockPath, options);
	try {
		return await action();
	} finally {
		await handle.close().catch(() => undefined);
		await fs.unlink(lockPath).catch(() => undefined);
	}
}

async function acquireMigrationReceiptLock(lockPath, options = {}) {
	const startedAt = Date.now();
	const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
	while (Date.now() - startedAt < timeoutMs) {
		try {
			const handle = await fs.open(lockPath, 'wx', 0o600);
			await handle.writeFile(JSON.stringify({
				pid: process.pid,
				createdAt: new Date().toISOString()
			}));
			await handle.sync();
			return handle;
		} catch (error) {
			if (error.code !== 'EEXIST') throw error;
			await removeStaleMigrationLock(lockPath, options.staleMs);
			await delay(options.retryDelayMs || 25);
		}
	}
	throw receiptLockError('MIGRATION_RECEIPT_LOCK_TIMEOUT');
}

async function removeStaleMigrationLock(lockPath, staleMs = DEFAULT_STALE_MS) {
	try {
		const stat = await fs.stat(lockPath);
		if (Date.now() - stat.mtimeMs > staleMs) await fs.unlink(lockPath);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function receiptLockError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	DEFAULT_STALE_MS,
	withMigrationReceiptLock,
	acquireMigrationReceiptLock,
	removeStaleMigrationLock
};
