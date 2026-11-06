//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importStorageAdmission.js
 * @description
 * The Awtsmoos measures the vessel before new import light is promised within;
 * Awtsmoos.com names low storage only on a real database directory, before ENOSPC can hide the cause.
 */

const fs = require('node:fs');
const { databaseRoot } = require('./jobStatePaths.js');

const GIBIBYTE = 1024 ** 3;
const DEFAULT_MINIMUM_FREE_GIB = 8;
const MAXIMUM_CONFIGURED_FREE_GIB = 1024 * 1024;
// Bulk-upload redesign §3.4: a held job auto-starts only once free space
// clears the floor PLUS this hysteresis margin, so a job is not released
// into a disk that is about to dip under the floor again.
const HELD_HYSTERESIS_GIB = 1;

/** Resolve a bounded positive operator override or the production-safe default. */
function minimumFreeGiB() {
	const configured = Number(process.env.AWTSMOOS_IMPORT_MIN_FREE_GB);
	if (!Number.isFinite(configured) || configured <= 0) {
		return DEFAULT_MINIMUM_FREE_GIB;
	}
	return Math.min(configured, MAXIMUM_CONFIGURED_FREE_GIB);
}

/** Reject file-shaped roots from capacity classification; persistence owns that error. */
function canMeasureDirectory(root, statSync = fs.statSync) {
	try {
		return statSync(root).isDirectory();
	} catch (error) {
		return error?.code === 'ENOENT';
	}
}

/** Measure the filesystem that contains the actual database root. */
function measureImportStorage($i, statfsSync = fs.statfsSync, statSync = fs.statSync) {
	const root = databaseRoot($i);
	if (!canMeasureDirectory(root, statSync)) return null;
	try {
		const facts = statfsSync(root);
		const availableBlocks = Number(facts?.bavail ?? facts?.bfree);
		const blockSize = Number(facts?.bsize);
		if (!Number.isFinite(availableBlocks) || !Number.isFinite(blockSize)) return null;
		if (availableBlocks < 0 || blockSize <= 0) return null;
		return {
			freeBytes: availableBlocks * blockSize,
			minimumFreeBytes: minimumFreeGiB() * GIBIBYTE
		};
	} catch (_) {
		return null;
	}
}

/** Return a storage-specific rejection only when low capacity is actually measured. */
function inspectImportStorage($i, statfsSync = fs.statfsSync, statSync = fs.statSync) {
	const measurement = measureImportStorage($i, statfsSync, statSync);
	if (!measurement) return { ok: true, measured: false };
	if (measurement.freeBytes >= measurement.minimumFreeBytes) {
		return { ok: true, measured: true, ...measurement };
	}
	return {
		error: 'IMPORT_STORAGE_LOW',
		message: 'Import storage is below the safe free-space floor. Restore capacity before retrying.',
		measured: true,
		// Bulk-upload redesign §3.2 (observability): every rejection says
		// whether a retry can help and when to try it.
		retryable: true,
		retryAfterMs: 60000,
		...measurement
	};
}

/**
 * True when the data volume has cleared the floor plus the 1 GiB held-job
 * hysteresis margin — the condition that releases held jobs (§3.4).
 */
function importStorageReadyForHeld($i, statfsSync = fs.statfsSync, statSync = fs.statSync) {
	const measurement = measureImportStorage($i, statfsSync, statSync);
	if (!measurement) return false;
	return measurement.freeBytes >= measurement.minimumFreeBytes + HELD_HYSTERESIS_GIB * GIBIBYTE;
}

module.exports = {
	DEFAULT_MINIMUM_FREE_GIB,
	GIBIBYTE,
	HELD_HYSTERESIS_GIB,
	canMeasureDirectory,
	importStorageReadyForHeld,
	inspectImportStorage,
	measureImportStorage,
	minimumFreeGiB
};
