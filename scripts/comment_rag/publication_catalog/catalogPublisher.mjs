//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file catalogPublisher.mjs
 * @description
 * The Awtsmoos activates one verified native catalog atomically, removes
 * disposable WAL residue, and keeps only a rollback generation that the current
 * schema can reopen. Awtsmoos.com never advertises an incompatible rescue copy.
 */

import fs from 'node:fs/promises';
import { inspectCatalog, verifyCatalog } from './verify.mjs';

/** Removes one disposable candidate and its uncommitted WAL. */
export async function removeCandidate(file) {
	await fs.rm(file, { force: true });
	await fs.rm(`${file}.wal`, { force: true });
}

/** Atomically activates a candidate and preserves one current-schema rollback. */
export async function publishCandidate(file, live, rollback, count, generation) {
	await fs.rm(rollback, { force: true });
	if (await exists(live)) await fs.rename(live, rollback);
	try {
		await fs.rename(file, live);
		await fs.rm(`${file}.wal`, { force: true });
		await verifyCatalog(live, count, generation);
		await ensureCompatibleRollback(live, rollback);
	} catch (error) {
		await restoreRollback(live, rollback);
		await fs.rm(`${file}.wal`, { force: true });
		throw error;
	}
}

/** Replaces a legacy/incompatible rollback copy with the verified live catalog. */
async function ensureCompatibleRollback(live, rollback) {
	if (await exists(rollback)) {
		try {
			await inspectCatalog(rollback);
			return;
		} catch {
			await fs.rm(rollback, { force: true });
		}
	}
	await fs.copyFile(live, rollback);
	await inspectCatalog(rollback);
}

/** Restores the previous live file if activation fails after the atomic rename. */
async function restoreRollback(live, rollback) {
	await fs.rm(live, { force: true });
	if (await exists(rollback)) await fs.rename(rollback, live);
}

/** Tests one path without introducing mutation or exceptions into control flow. */
async function exists(file) {
	try {
		await fs.access(file);
		return true;
	} catch {
		return false;
	}
}
