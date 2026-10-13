// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchDeadline
 * @description
 * One public search owns one wall-clock covenant. Discovery, lexical baseline,
 * semantic enrichment, and optional catalog work all spend from the same clock
 * instead of quietly adding independent timeout windows after one another.
 */

const BASELINE_DEADLINE_MS = 3500;
const BASELINE_TEXT_ROWS = 4000;
const BASELINE_SCAN_MS = 3500;
const CANONICAL_CATALOG_WAIT_MS = 350;
const DEFAULT_LIBRARY_DEADLINE_MS = 8000;
const LEXICAL_ENRICHMENT_SLICE_MS = 1200;
const MIN_LIBRARY_DEADLINE_MS = 500;
const MAX_LIBRARY_DEADLINE_MS = 15000;
// Vector strategy walks multipart persisted HNSW indexes (28 parts for
// likkutei-sichos) after embedding the query; the search UI already waits
// 45s for semantic answers, so the vector lane owns a larger bounded clock.
const VECTOR_MAX_LIBRARY_DEADLINE_MS = 30000;

/** Returns the deadline ceiling for one request strategy. */
function maxDeadlineFor(options = {}) {
	return String(options.strategy || '').toLowerCase() === 'vector'
		? VECTOR_MAX_LIBRARY_DEADLINE_MS
		: MAX_LIBRARY_DEADLINE_MS;
}

/** Resolves one bounded request deadline without accepting infinite callers. */
function libraryDeadlineMs(value, options = {}) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_LIBRARY_DEADLINE_MS;
	return Math.max(
		MIN_LIBRARY_DEADLINE_MS,
		Math.min(maxDeadlineFor(options), Math.floor(number))
	);
}

/** Returns the request's absolute deadline, preserving an existing planner deadline. */
function libraryDeadlineAt(options = {}, startedAt = Date.now()) {
	const supplied = Number(options.libraryDeadlineAt);
	if (Number.isFinite(supplied) && supplied > 0) return supplied;
	return startedAt + libraryDeadlineMs(options.libraryMaxMs, options);
}

/** Returns only time still owned by the request; exhausted phases receive zero. */
function remainingLibraryMs(deadlineAt, now = Date.now()) {
	return Math.max(0, Math.floor(Number(deadlineAt) - now));
}

/** Bounds one operation from the caller while allowing immutable warmup to finish later. */
async function withLaneDeadline(operation, laneId, timeoutMs) {
	const waitMs = Math.max(1, Math.floor(Number(timeoutMs) || 0));
	let timer = null;
	try {
		return await Promise.race([
			Promise.resolve().then(operation),
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(Object.assign(
					new Error(`Library lane ${laneId} exceeded its public deadline.`),
					{ code: 'LIBRARY_LANE_TIMEOUT', laneId }
				)), waitMs);
			})
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

module.exports = {
	BASELINE_DEADLINE_MS,
	BASELINE_SCAN_MS,
	BASELINE_TEXT_ROWS,
	CANONICAL_CATALOG_WAIT_MS,
	DEFAULT_LIBRARY_DEADLINE_MS,
	LEXICAL_ENRICHMENT_SLICE_MS,
	MIN_LIBRARY_DEADLINE_MS,
	VECTOR_MAX_LIBRARY_DEADLINE_MS,
	libraryDeadlineAt,
	libraryDeadlineMs,
	remainingLibraryMs,
	withLaneDeadline
};
