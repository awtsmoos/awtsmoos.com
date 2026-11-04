//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LibrarySearch
 * @description The Awtsmoos lets exact Torah navigation take the shortest path,
 * while Awtsmoos.com lets independent catalog and lane discovery spend the same
 * bounded public clock instead of waiting behind one another.
 */

const { availableShards } = require('./shards.js');
const { ragSearch } = require('./search.js');
const { mergeLaneSearches } = require('./librarySearchMerge.js');
const {
	canonicalWorkHits,
	registeredSummary,
	workHit
} = require('./canonicalWorkSearch.js');
const { exactTanachHits } = require('./exactTanachNavigation.js');
const { promoteNavigationHits } = require('./navigationPromotion.js');
const { canonicalNavigationResult } = require('./canonicalNavigationResult.js');
const {
	CANONICAL_CATALOG_WAIT_MS,
	libraryDeadlineAt,
	remainingLibraryMs,
	withLaneDeadline
} = require('./librarySearchDeadline.js');
const {
	boundedLaneSearch,
	laneSearchOptions,
	settleLibraryLanes
} = require('./librarySearchPlanner.js');
const {
	readLibraryResponse,
	rememberLibraryResponse
} = require('./libraryResponseCache.js');
const { withLibrarySearchAdmission } = require('./librarySearchAdmission.js');

/** Gives unknown canonical-work discovery only time still owned by this request. */
async function boundedCatalogHits(options, limit, timeoutMs = CANONICAL_CATALOG_WAIT_MS) {
	if (timeoutMs <= 0) return [];
	return withLaneDeadline(
		() => canonicalWorkHits({ $i: options.$i, query: options.query, limit }),
		'canonical-work-catalog',
		timeoutMs
	).catch(() => []);
}

/** Searches the public Torah library while independent optional work shares one clock. */
async function librarySearch(options = {}) {
	if (String(options.lane || '').trim()) return ragSearch(options);
	const startedAt = Date.now();
	const deadlineAt = libraryDeadlineAt(options, startedAt);
	const limit = Math.max(1, Number(options.limit) || 20);
	const registered = registeredSummary(options.query);
	if (registered) {
		return canonicalNavigationResult(
			options.query,
			[workHit(registered, 1)],
			startedAt,
			limit
		);
	}
	const tanachHits = exactTanachHits({ query: options.query, limit: Math.min(3, limit) });
	if (tanachHits.length) {
		return canonicalNavigationResult(options.query, tanachHits, startedAt, limit);
	}
	const lanes = await availableShards({ $i: options.$i });
	if (!lanes.length) return ragSearch(options);
	const cached = readLibraryResponse(options, lanes);
	if (cached) {
		if (cached.value.index) cached.value.index.responseCacheHit = true;
		return cached.value;
	}
	// The fan-out itself runs under admission for vector strategy: a bounded
	// number of all-libraries semantic searches execute at once, and queued
	// requests spend their own deadline waiting instead of stacking seven
	// lane fan-outs onto the box until it falls over.
	const executeAllLanes = async () => {
		const catalogWait = Math.min(
			CANONICAL_CATALOG_WAIT_MS,
			remainingLibraryMs(deadlineAt)
		);
		const [settled, workHits] = await Promise.all([
			settleLibraryLanes(lanes, { ...options, libraryDeadlineAt: deadlineAt }),
			boundedCatalogHits(options, Math.min(5, limit), catalogWait)
		]);
		try {
			const merged = mergeLaneSearches({
				lanes,
				limit,
				query: options.query,
				settled,
				totalMs: Date.now() - startedAt
			});
			const result = promoteNavigationHits(merged, workHits, limit);
			rememberLibraryResponse(options, lanes, result);
			return result;
		} catch (error) {
			if (!workHits.length) throw error;
			return canonicalNavigationResult(options.query, workHits, startedAt, limit);
		}
	};
	return withLibrarySearchAdmission(options, deadlineAt, executeAllLanes);
}

module.exports = {
	boundedCatalogHits,
	boundedLaneSearch,
	laneSearchOptions,
	librarySearch,
	settleLibraryLanes
};
