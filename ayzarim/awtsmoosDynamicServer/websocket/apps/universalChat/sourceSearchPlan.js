// B"H
// Boruch Hashem
// Blessed is He

const { librarySearch } = require("../../../../../geelooy/api/social/helper/search/rag/librarySearch.js");
const { settleWithin } = require("./sourceSearchTimeout.js");

/**
 * @file Stages private Torah library search so useful trusted sources arrive before the largest multipart corpora are invited.
 * @description The Awtsmoos contains every sefer in one indivisible truth, while Awtsmoos.com opens finite shelves in measured light;
 * small canonical lanes answer first, and only a sparse answer awakens a bounded sample of the broad libraries instead of flooding the night.
 */

const FAST_LANES = Object.freeze(["meluket", "sefer-hasichos"]);
const DEEP_LANES = Object.freeze(["sichos-kodesh", "likkutei-sichos"]);
const ENOUGH_HITS = 8;
const FAST_TIMEOUT_MS = 12000;
const DEEP_TIMEOUT_MS = 9000;

/** Returns one or more named-lane RAG results without ever invoking the unscoped all-lane search path. */
async function searchLibraryStages(context, query, settings = {}) {
	const search = settings.search || librarySearch;
	const settle = settings.settle || settleWithin;
	const fast = await searchPhase({
		lanes: FAST_LANES,
		context,
		query,
		search,
		settle,
		timeoutMs: FAST_TIMEOUT_MS,
		budget: fastBudget()
	});
	if (hitCount(fast.results) >= ENOUGH_HITS) {
		return fast.results;
	}
	const deep = await searchPhase({
		lanes: DEEP_LANES,
		context,
		query,
		search,
		settle,
		timeoutMs: DEEP_TIMEOUT_MS,
		budget: deepBudget()
	});
	const results = [...fast.results, ...deep.results];
	if (results.length) {
		return results;
	}
	throw fast.errors[0] || deep.errors[0] || new Error("No Torah library lane could be searched.");
}

async function searchPhase(options) {
	const settled = await Promise.allSettled(options.lanes.map((lane) => {
		const request = Promise.resolve().then(() => options.search({
			...baseRequest(options.context, options.query),
			...options.budget,
			lane
		}));
		return options.settle(request, `Library ${lane}`, options.timeoutMs);
	}));
	return {
		results: settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value),
		errors: settled.filter((entry) => entry.status === "rejected").map((entry) => entry.reason)
	};
}

function baseRequest(context, query) {
	return {
		$i: context.server,
		query,
		limit: 12,
		autoInstall: false,
		strategy: "text",
		requireIndexed: false,
		includeComments: true,
		includeMetadataComments: true,
		maxCommentRows: 8
	};
}

function fastBudget() {
	return {
		textPartLimit: 1,
		textMaxRows: 8000,
		textMaxMs: 3500,
		textMinRows: 512
	};
}

function deepBudget() {
	return {
		textPartLimit: 3,
		textMaxRows: 2400,
		textMaxMs: 1400,
		textMinRows: 256
	};
}

function hitCount(results) {
	return results.reduce((total, result) => total + (result?.hits?.length || 0), 0);
}

module.exports = {
	DEEP_LANES,
	ENOUGH_HITS,
	FAST_LANES,
	searchLibraryStages
};
