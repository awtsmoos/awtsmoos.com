//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LibrarySearchPlanner
 * @description The Awtsmoos lets independent search vessels answer together instead
 * of waiting in a needless line; Awtsmoos.com preserves deliberate Hebrew lexical
 * sequencing while neutral text and vector discovery share one bounded first breath.
 */

const { ragSearch } = require('./search.js');
const { requiresLexicalSearch } = require('./queryLanguagePolicy.js');
const {
	BASELINE_DEADLINE_MS,
	BASELINE_SCAN_MS,
	BASELINE_TEXT_ROWS,
	libraryDeadlineAt,
	remainingLibraryMs,
	withLaneDeadline
} = require('./librarySearchDeadline.js');
const {
	exhaustedLane,
	lexicalLaneOrder,
	settleLexicalEnrichment
} = require('./libraryLexicalPlanner.js');
const {
	laneBlock,
	recordLaneFailure,
	recordLaneSuccess
} = require('./laneCircuitBreaker.js');

/** Gives text-only baseline lanes a cheaper scan without overriding explicit callers. */
function laneSearchOptions(lane, options, timeoutMs) {
	const textOnly = lane.textOnly === true;
	return {
		...options,
		lane: lane.id,
		strategy: textOnly ? 'text' : options.strategy,
		textMaxRows: textOnly
			? Number(options.textMaxRows) || BASELINE_TEXT_ROWS
			: options.textMaxRows,
		textMaxMs: Math.min(
			timeoutMs,
			Number(options.textMaxMs) || (textOnly ? BASELINE_SCAN_MS : timeoutMs)
		)
	};
}

/**
 * Searches one published lane beneath one explicit phase deadline. A lane
 * whose circuit is open after recent deterministic failures is skipped and
 * reported as a lane failure instead of re-paying spawn/timeout costs.
 */
async function boundedLaneSearch(lane, options, timeoutMs) {
	const blocked = laneBlock(lane.id);
	if (blocked) {
		throw Object.assign(new Error(blocked.message), {
			code: blocked.code,
			laneId: lane.id
		});
	}
	try {
		const result = await withLaneDeadline(
			() => ragSearch(laneSearchOptions(lane, options, timeoutMs)),
			lane.id,
			timeoutMs
		);
		recordLaneSuccess(lane.id);
		return result;
	} catch (error) {
		recordLaneFailure(lane.id, error);
		throw error;
	}
}

/** Settles independent lanes concurrently while preserving their original ordering. */
async function settleGroup(lanes, options, timeoutMs) {
	if (timeoutMs <= 0) {
		return new Map(lanes.map(lane => [lane.id, exhaustedLane(lane)]));
	}
	const entries = await Promise.allSettled(
		lanes.map(lane => boundedLaneSearch(lane, options, timeoutMs))
	);
	return new Map(lanes.map((lane, index) => [lane.id, entries[index]]));
}

/** Reveals whether a request needs ordered Hebrew lexical enrichment or concurrent discovery. */
function searchPlanMode(options = {}) {
	if (String(options.strategy || '').toLowerCase() === 'vector') return 'concurrent';
	return requiresLexicalSearch(options.query) ? 'lexical' : 'concurrent';
}

/** Runs neutral text/vector lanes together; Hebrew text keeps baseline-first lexical ordering. */
async function settleLibraryLanes(lanes, options = {}) {
	const deadlineAt = libraryDeadlineAt(options);
	const mode = searchPlanMode(options);
	if (mode === 'concurrent') {
		const remainingMs = remainingLibraryMs(deadlineAt);
		const strategy = String(options.strategy || '').toLowerCase();
		const timeoutMs = strategy === 'vector'
			? remainingMs
			: Math.min(BASELINE_DEADLINE_MS, remainingMs);
		if (timeoutMs <= 0) return lanes.map(exhaustedLane);
		return Promise.allSettled(
			lanes.map(lane => boundedLaneSearch(lane, options, timeoutMs))
		);
	}
	const baseline = lanes.filter(lane => lane.textOnly === true);
	const enrichment = lanes.filter(lane => lane.textOnly !== true);
	const answers = await settleGroup(
		baseline,
		options,
		Math.min(BASELINE_DEADLINE_MS, remainingLibraryMs(deadlineAt))
	);
	const enriched = await settleLexicalEnrichment(
		enrichment,
		deadlineAt,
		(lane, timeoutMs) => boundedLaneSearch(lane, options, timeoutMs)
	);
	for (const [id, answer] of enriched) answers.set(id, answer);
	return lanes.map(lane => answers.get(lane.id) || exhaustedLane(lane));
}

module.exports = {
	boundedLaneSearch,
	laneSearchOptions,
	lexicalLaneOrder,
	searchPlanMode,
	settleLibraryLanes
};
