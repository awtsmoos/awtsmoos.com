// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultiLaneMergeHelpers
 * @description
 * The Awtsmoos lets many library answers take turns without one voice swallowing another in the search refrain;
 * Awtsmoos.com keeps ranking rotation, aggregate metadata, and timing in small vessels so the merge coordinator stays plain.
 */

/** Interleaves lane hit groups in stable round-robin order up to the requested limit. */
function roundRobinHits(groups, limit) {
	const hits = [];
	for (let index = 0; hits.length < limit; index += 1) {
		let added = false;
		for (const group of groups) {
			if (!group[index]) continue;
			hits.push({
				...group[index],
				rank: hits.length + 1
			});
			added = true;
			if (hits.length >= limit) break;
		}
		if (!added) break;
	}
	return hits;
}

/** Creates neutral aggregate metadata for a search spanning every published library. */
function allLibrariesShard(lanes) {
	return {
		id: 'all',
		title: 'All published libraries',
		count: lanes.reduce(
			(sum, lane) => sum + Number(lane.count || 0),
			0
		),
		partial: lanes.some(lane => lane.partial === true)
	};
}

/** Preserves per-lane timing evidence under already-neutral public lane identities. */
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
	allLibrariesShard,
	laneTimings,
	roundRobinHits
};
