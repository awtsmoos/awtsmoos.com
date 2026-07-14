// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchHydration
 * @description
 * Comment windows enrich source hits when available, yet comment storage failure
 * never erases readable search results already found in the library.
 */

const { joinComments } = require('./comments.js');
const { buildCommentHits } = require('./commentRelevance.js');
const { timed } = require('./timer.js');

async function hydrateSearch(options) {
	const hydrated = await hydrateSafely(options);
	const commentHits = options.includeComments
		? await rankCommentsSafely({
			...options,
			hits: hydrated
		})
		: [];
	return {
		hydrated,
		commentHits
	};
}

async function hydrateSafely(options) {
	if (!options.includeComments) return options.hits;
	try {
		return await timed(
			'hydrateCommentsMs',
			options.timings,
			() => joinComments(options)
		);
	} catch (error) {
		options.timings.commentHydrationFallback = error.code || error.message;
		return options.hits;
	}
}

async function rankCommentsSafely(options) {
	try {
		return await timed(
			'rankCommentsMs',
			options.timings,
			() => buildCommentHits(
				options.hits,
				options.query,
				commentLimit(options)
			)
		);
	} catch (error) {
		options.timings.commentRankingFallback = error.code || error.message;
		return [];
	}
}

function commentLimit(options) {
	const base = Number(options.limit || 10);
	const rows = Number(options.maxRows || 12);
	return Math.min(120, Math.max(base * rows, base));
}

module.exports = {
	hydrateSearch
};
