// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchHydration
 * @description
 * Comment storage remains sealed unless a caller explicitly requests comment
 * enrichment. Plain source search therefore pays no comment-database import,
 * ranking, or hydration cost, while failures still preserve readable hits.
 */

const { timed } = require('./timer.js');

async function hydrateSearch(options) {
	if (!options.includeComments) {
		return {
			hydrated: options.hits,
			commentHits: []
		};
	}
	const hydrated = await hydrateSafely(options);
	const commentHits = await rankCommentsSafely({
		...options,
		hits: hydrated
	});
	return { hydrated, commentHits };
}

async function hydrateSafely(options) {
	try {
		const { joinComments } = require('./comments.js');
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
		const { buildCommentHits } = require('./commentRelevance.js');
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
