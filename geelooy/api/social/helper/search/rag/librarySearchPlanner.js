// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchPlanner
 * @description
 * Ordinary library search reserves its first measured breath for a cheap lexical
 * lane, then gives optional enrichment only time still owned by the same request.
 * Hebrew uses sequential lexical lanes; English semantic search stays concurrent.
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

/** Gives text-only baseline lanes a smaller scan while preserving explicit caller overrides. */
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

/** Searches one published lane beneath the supplied phase deadline. */
function boundedLaneSearch(lane, options, timeoutMs) {
	return withLaneDeadline(
		() => ragSearch(laneSearchOptions(lane, options, timeoutMs)),
		lane.id,
		timeoutMs
	);
}

async function settleGroup(lanes, options, timeoutMs) {
	if (timeoutMs <= 0) return new Map(lanes.map(lane => [lane.id, exhaustedLane(lane)]));
	const entries = await Promise.allSettled(
		lanes.map(lane => boundedLaneSearch(lane, options, timeoutMs))
	);
	return new Map(lanes.map((lane, index) => [lane.id, entries[index]]));
}

/** Executes lexical baseline before optional enrichment beneath one absolute request deadline. */
async function settleLibraryLanes(lanes, options = {}) {
	const deadlineAt = libraryDeadlineAt(options);
	if (String(options.strategy || '').toLowerCase() === 'vector') {
		const timeoutMs = remainingLibraryMs(deadlineAt);
		if (timeoutMs <= 0) return lanes.map(exhaustedLane);
		return Promise.allSettled(lanes.map(lane => boundedLaneSearch(lane, options, timeoutMs)));
	}
	const baseline = lanes.filter(lane => lane.textOnly === true);
	const enrichment = lanes.filter(lane => lane.textOnly !== true);
	const answers = await settleGroup(
		baseline,
		options,
		Math.min(BASELINE_DEADLINE_MS, remainingLibraryMs(deadlineAt))
	);
	const enriched = requiresLexicalSearch(options.query)
		? await settleLexicalEnrichment(
			enrichment,
			deadlineAt,
			(lane, timeoutMs) => boundedLaneSearch(lane, options, timeoutMs)
		)
		: await settleGroup(enrichment, options, remainingLibraryMs(deadlineAt));
	for (const [id, answer] of enriched) answers.set(id, answer);
	return lanes.map(lane => answers.get(lane.id) || exhaustedLane(lane));
}

module.exports = {
	boundedLaneSearch,
	laneSearchOptions,
	lexicalLaneOrder,
	settleLibraryLanes
};
