// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibraryLexicalPlanner
 * @description
 * Hebrew-script enrichment walks from cheap immutable publications toward large
 * multipart corpora one lane at a time. This protects exact lexical truth from
 * disk contention while preserving truthful deadline testimony for skipped lanes.
 */

const {
	LEXICAL_ENRICHMENT_SLICE_MS,
	remainingLibraryMs
} = require('./librarySearchDeadline.js');

/** Returns deterministic rejected testimony for a lane with no request time left. */
function exhaustedLane(lane) {
	return {
		status: 'rejected',
		reason: Object.assign(new Error(`Library lane ${lane.id} had no request time remaining.`), {
			code: 'LIBRARY_DEADLINE_EXHAUSTED',
			laneId: lane.id
		})
	};
}

/** Orders lexical enrichment from one-part/small corpora toward multipart giants. */
function lexicalLaneOrder(lanes) {
	return [...lanes].sort((left, right) => (
		partCount(left) - partCount(right)
		|| Number(left.count || 0) - Number(right.count || 0)
	));
}

function partCount(lane) {
	return Array.isArray(lane.parts) ? lane.parts.length : 1;
}

/** Runs Hebrew lexical enrichments sequentially beneath one absolute deadline. */
async function settleLexicalEnrichment(lanes, deadlineAt, searchLane) {
	const answers = new Map();
	for (const lane of lexicalLaneOrder(lanes)) {
		const remaining = remainingLibraryMs(deadlineAt);
		if (remaining <= 0) {
			answers.set(lane.id, exhaustedLane(lane));
			continue;
		}
		const timeoutMs = Math.min(LEXICAL_ENRICHMENT_SLICE_MS, remaining);
		const [answer] = await Promise.allSettled([searchLane(lane, timeoutMs)]);
		answers.set(lane.id, answer);
	}
	return answers;
}

module.exports = {
	exhaustedLane,
	lexicalLaneOrder,
	settleLexicalEnrichment
};
