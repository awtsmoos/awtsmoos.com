//B"H
//Blessed is He
//Boruch Hashem

/**
 * Bulk import OOM guards and the job log (split from bulkImportRoutes.js).
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// OOM guards (2026-10-09 fix for the 2026-09-30 bulk-import quarantine).
//
// The 1.9 GB production Node server was OOM-killed by POSTs carrying large
// inline `items` arrays: the JSON body parses to 3-5x its wire size in JS
// objects, then gets copied into job.spec.items, comments[], merged[], and
// the serialized output — 4-5x memory amplification on top of the ~1 GB
// baseline. The publishAll path (chunked /stage upload + one-file-at-a-time
// streaming) is the blessed path for large imports and is NOT gated here.
// ---------------------------------------------------------------------------
const INLINE_ITEMS_MAX_COUNT = 2000;          // hard cap on inline items per perPost job
const INLINE_ITEMS_MAX_BYTES = 2 * 1024 * 1024; // 2 MB estimated wire size cap
const HEAP_GUARD_BYTES = 1200 * 1024 * 1024;    // refuse new jobs above 1.2 GB heap

function heapTooHigh() {
	try {
		const mu = process.memoryUsage();
		return mu.heapUsed > HEAP_GUARD_BYTES;
	} catch (_) {
		return false;
	}
}

function memoryGuardError() {
	return {
		success: false,
		error: 'SERVER_MEMORY_HIGH',
		message: 'Server heap is above the safe threshold for new import jobs. Retry shortly.',
	};
}

function jobLogPath($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'bulk-import-jobs.log');
}

function appendJobLog($i, entry) {
	try {
		fs.appendFileSync(jobLogPath($i), JSON.stringify({ at: Date.now(), ...entry }) + '\n');
	} catch (_) { /* best effort */ }
}

module.exports = {
	INLINE_ITEMS_MAX_COUNT,
	INLINE_ITEMS_MAX_BYTES,
	HEAP_GUARD_BYTES,
	heapTooHigh,
	memoryGuardError,
	jobLogPath,
	appendJobLog,
};
