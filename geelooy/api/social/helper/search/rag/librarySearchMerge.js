// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultiLaneSearchMerge
 * @description
 * The Awtsmoos interleaves published Torah libraries so no single corpus swallows the seeker or leaks a hidden machine name;
 * Awtsmoos.com preserves completeness, ranking, timing, and neutral lane identity while one failed lane remains honestly plain.
 */

const {
	annotateLaneHit,
	laneMetadata
} = require('./libraryLaneMetadata.js');
const {
	allLibrariesShard,
	laneTimings,
	roundRobinHits
} = require('./librarySearchMergeHelpers.js');

/** Collects fulfilled lane answers and neutral failure metadata before ranking. */
function collectLaneResults(lanes, settled) {
	const successes = [];
	const failures = [];
	settled.forEach((entry, index) => {
		const lane = lanes[index];
		const metadata = laneMetadata(lane);
		if (entry.status === 'fulfilled') {
			successes.push(annotateLane(entry.value, lane, metadata));
			return;
		}
		failures.push({
			id: metadata.id,
			message: entry.reason?.message || 'Lane search failed.'
		});
	});
	return {
		successes,
		failures
	};
}

/** Adds one lane's public metadata to every result hit without changing score order. */
function annotateLane(result, lane, metadata) {
	return {
		...result,
		libraryLane: metadata,
		hits: (result.hits || [])
			.map(hit => annotateLaneHit(hit, lane, metadata))
	};
}

/** Merges concurrent lane results into one bounded, truthful public search response. */
function mergeLaneSearches({ lanes, limit, query, settled, totalMs }) {
	const {
		successes,
		failures
	} = collectLaneResults(lanes, settled);
	if (!successes.length) {
		throw settled[0]?.reason
			|| new Error('No library lane could be searched.');
	}
	const hits = roundRobinHits(
		successes.map(result => result.hits),
		limit
	);
	const modes = [...new Set(successes.map(result => result.mode))];
	const persisted = successes.every(
		result => result.index?.persisted === true
	);
	return {
		BH: 'B"H',
		query,
		shard: allLibrariesShard(lanes),
		mode: modes.length === 1 ? modes[0] : 'mixed',
		strictIndexed: false,
		indexed: persisted,
		index: {
			persisted,
			responseCacheHit: false
		},
		message: `${hits.length} source segments matched across ${successes.length} published libraries.`,
		totalRows: successes.reduce(
			(sum, result) => sum + Number(result.totalRows || 0),
			0
		),
		vectorSource: 'multi-lane-library',
		engine: 'awtsmoos-multi-lane-search',
		timings: laneTimings(successes, totalMs),
		embedder: successes[0].embedder || null,
		hits,
		commentHits: successes.flatMap(result => result.commentHits || []),
		lanes: successes.map(result => result.libraryLane),
		laneErrors: failures
	};
}

module.exports = {
	collectLaneResults,
	mergeLaneSearches,
	roundRobinHits
};
