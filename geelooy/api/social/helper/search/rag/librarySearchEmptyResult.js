//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LibrarySearchEmptyResult
 * @description The Awtsmoos lets a finite public deadline end truthfully instead of
 * becoming a false crash; Awtsmoos.com preserves every bounded lane failure while
 * unexpected errors still remain visible to the caller and the maintainer.
 */

const {
	allLibrariesShard,
	laneTimings
} = require('./librarySearchMergeHelpers.js');
const { withSearchCategories } = require('./searchResultCategories.js');

/**
 * Failure codes that are a lane's own truthful testimony of unavailability,
 * not a defect in the request: the public clock ran out, the lane is paused
 * by its circuit breaker, its store refused a write in read-only service,
 * it could not prove persisted provenance for a strict request, it has no
 * usable text surface, or the shared embedder is still warming. Whenever at
 * least one sibling lane succeeds, these already ride home per-lane in
 * laneErrors; when no lane succeeds, iteration 7 lets the same testimony
 * produce the honest partial empty result instead of a request-level 500 —
 * a bare 500 taught the visitor client to disguise keyword results as a
 * semantic answer. Untyped or unexpected faults (a vanished file, a code
 * bug) are absent from this set on purpose and still throw.
 */
const BOUNDED_FAILURE_CODES = new Set([
	'LIBRARY_DEADLINE_EXHAUSTED',
	'LIBRARY_LANE_TIMEOUT',
	'LANE_CIRCUIT_OPEN',
	'STRICT_INDEX_PROVENANCE_MISSING',
	'MULTILINGUAL_WORKER_WARMING',
	'AWTSMOOS_DB_READONLY_WRITE',
	'TEXT_SEARCH_UNAVAILABLE'
]);

/** Returns true only when every settled lane ended through an intentional bound. */
function areBoundedLaneFailures(settled = []) {
	return settled.length > 0 && settled.every(entry => (
		entry?.status === 'rejected'
		&& BOUNDED_FAILURE_CODES.has(entry.reason?.code)
	));
}

/** Returns the first real failure so unexpected faults are never disguised as latency. */
function firstLaneFailure(settled = []) {
	return settled.find(entry => entry?.status === 'rejected')?.reason
		|| new Error('No library lane could be searched.');
}

/** Builds the normal public search shape for a bounded request with zero completed lanes. */
function emptyLaneSearchResult({ failures, lanes, query, totalMs }) {
	return withSearchCategories({
		BH: 'B"H',
		query,
		shard: allLibrariesShard(lanes),
		mode: 'mixed',
		strictIndexed: false,
		indexed: false,
		index: { persisted: false, responseCacheHit: false },
		message: 'No published library completed before the request deadline.',
		totalRows: 0,
		vectorSource: 'multi-lane-library',
		engine: 'awtsmoos-multi-lane-search',
		timings: laneTimings([], totalMs),
		embedder: null,
		hits: [],
		commentHits: [],
		lanes: [],
		laneErrors: failures,
		partial: true
	});
}

module.exports = {
	BOUNDED_FAILURE_CODES,
	areBoundedLaneFailures,
	emptyLaneSearchResult,
	firstLaneFailure
};
