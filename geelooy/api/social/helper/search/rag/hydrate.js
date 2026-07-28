// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchHydration
 * @description
 * Static translated metadata is attached without database I/O. Explicit comment
 * requests hydrate only unresolved hits, preserving bounded memory behavior.
 */

const { timed } = require('./timer.js');
const {
	attachMetadataComments
} = require('./metadataCommentHits.js');

async function hydrateSearch(options) {
	const metadata = attachMetadataComments(
		options.hits,
		options.includeMetadataComments !== false
	);
	if (!options.includeComments) {
		return rankedResult(options, metadata.hydrated);
	}
	const unresolved = options.hits.filter((_, index) => !metadata.satisfied.has(index));
	const databaseHits = unresolved.length
		? await hydrateSafely({ ...options, hits: unresolved })
		: [];
	let databaseIndex = 0;
	const hydrated = metadata.hydrated.map((hit, index) => {
		return metadata.satisfied.has(index)
			? hit
			: databaseHits[databaseIndex++];
	});
	return rankedResult(options, hydrated);
}

async function rankedResult(options, hydrated) {
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
