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

const BOUNDED_FAILURE_CODES = new Set([
	'LIBRARY_DEADLINE_EXHAUSTED',
	'LIBRARY_LANE_TIMEOUT'
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
