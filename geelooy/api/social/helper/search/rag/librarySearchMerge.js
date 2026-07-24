// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultiLaneSearchMerge
 * @description
 * Published lane answers are labeled and interleaved so every corpus remains
 * visible. Completeness metadata follows every lane and hit, while a failed lane
 * is reported explicitly without erasing healthy results.
 */

const {
	annotateLaneHit,
	laneMetadata
} = require('./libraryLaneMetadata.js');

function mergeLaneSearches({ lanes, limit, query, settled, totalMs }) {
	const successes = [];
	const failures = [];
	settled.forEach((entry, index) => {
		const lane = lanes[index];
		if (entry.status === 'fulfilled') {
			successes.push(annotateLane(entry.value, lane));
			return;
		}
		failures.push({
			id: lane.id,
			message: entry.reason?.message || 'Lane search failed.'
		});
	});
	if (!successes.length) {
		throw settled[0]?.reason || new Error('No library lane could be searched.');
	}
	const hits = roundRobinHits(successes.map(result => result.hits), limit);
	const modes = [...new Set(successes.map(result => result.mode))];
	const persisted = successes.every(result => result.index?.persisted === true);
	return {
		BH: 'B"H',
		query,
		shard: allLibrariesShard(lanes),
		mode: modes.length === 1 ? modes[0] : 'mixed',
		strictIndexed: false,
		indexed: persisted,
		index: { persisted, responseCacheHit: false },
		message: `${hits.length} source segments matched across ${successes.length} published libraries.`,
		totalRows: successes.reduce((sum, result) => sum + Number(result.totalRows || 0), 0),
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

function annotateLane(result, lane) {
	const metadata = laneMetadata(lane);
	return {
		...result,
		libraryLane: metadata,
		hits: (result.hits || []).map(hit => annotateLaneHit(hit, lane, metadata))
	};
}

function roundRobinHits(groups, limit) {
	const hits = [];
	for (let index = 0; hits.length < limit; index += 1) {
		let added = false;
		for (const group of groups) {
			if (!group[index]) continue;
			hits.push({ ...group[index], rank: hits.length + 1 });
			added = true;
			if (hits.length >= limit) break;
		}
		if (!added) break;
	}
	return hits;
}

function allLibrariesShard(lanes) {
	return {
		id: 'all',
		title: 'All published libraries',
		count: lanes.reduce((sum, lane) => sum + Number(lane.count || 0), 0),
		partial: lanes.some(lane => lane.partial === true)
	};
}

function laneTimings(successes, totalMs) {
	return {
		totalMs,
		lanes: successes.map(result => ({
			id: result.libraryLane.id,
			totalMs: result.timings?.totalMs || 0
		}))
	};
}

module.exports = {
	mergeLaneSearches,
	roundRobinHits
};
