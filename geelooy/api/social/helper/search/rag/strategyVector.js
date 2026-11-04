//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module StrategyVector
 * @description
 * The Awtsmoos retrieves persisted Torah vectors from one generation-aware well;
 * Awtsmoos.com reuses immutable source hits, but fresh pending comments have their own story to tell.
 */

const { queryLanguage } = require('./queryLanguagePolicy.js');
const { assertEnglishSemanticCorpus } = require('./semanticCorpusPolicy.js');
const { searchCachedSource } = require('./indexedSourceCache.js');
const { timed } = require('./timer.js');
const { codedError } = require('./strategyText.js');

/** Refuses false vector claims when a publication is text-only. */
function assertTextOnlyRequest(options, strategy) {
	if (options.requireIndexed !== true && strategy !== 'vector') return;
	throw codedError(
		'TEXT_ONLY_LANE',
		`Lane ${options.shard.id} is published as bounded text mirrors, not vectors.`
	);
}

/** Searches indexed source rows without caching live comment hydration. */
async function vectorSource(options) {
	assertEnglishSemanticCorpus(options.shard);
	const { embedForShard } = require('./queryEmbedder.js');
	const { searchShard } = require('./sourceSearch.js');
	const embedding = await timed('embeddingMs', options.timings, () => embedForShard(options));
	const limit = options.limit || 10;
	const source = await timed('searchVectorsMs', options.timings, () => {
		return searchCachedSource({
			shard: options.shard,
			query: options.query,
			limit,
			embedder: embedding.embedder
		}, () => searchShard(options.shard, embedding.vector, limit, {
			requireIndexed: options.requireIndexed === true,
			deadlineAt: Number(options.libraryDeadlineAt) || 0
		}));
	});
	options.timings.sourceCacheHit = source.sourceCacheHit === true;
	// SEARCH ITERATION 8 (2026-11-04): pending-comment-vector hits are NOT
	// served by default. The persisted pending store was embedded from the
	// defective pre-correction English, its rows carry no text (so visitor
	// cards render empty), its drain path was never wired into publication,
	// and corrected re-imports were silently deduped away — yet its raw
	// cosine scores outranked every real publication (measured: 15 of the
	// top 20 for "tzedakah charity", all textless, 2026-10-06 vectors above
	// live publications). Pending vectors are pre-publication staging:
	// import noting keeps filling the store exactly as before, but nothing
	// unpublished may outrank the library. Serving resumes only when an
	// operator explicitly sets AWTSMOOS_SERVE_PENDING_VECTORS=true after
	// the lane has been drained and repopulated from the corrected corpus.
	let hits = source.hits;
	if (process.env.AWTSMOOS_SERVE_PENDING_VECTORS === 'true') {
		const { searchPendingVectors, mergePendingHits } = require('./pendingCommentVectors.js');
		try {
			const pending = await searchPendingVectors({
				$i: options.$i,
				queryVector: embedding.vector,
				limit
			});
			hits = mergePendingHits(source.hits, pending, limit);
		} catch (_error) {}
	}
	return {
		...source,
		index: { ...source.index, sourceCacheHit: source.sourceCacheHit === true },
		hits,
		mode: 'vector',
		queryLanguage: queryLanguage(options.query),
		engine: 'custom-english-semantic-vector-search',
		embedder: embedding.embedder,
		indexed: source.index?.persisted === true,
		strictIndexed: options.requireIndexed === true,
		message: `${hits.length} English source segments ranked semantically.`
	};
}

module.exports = { assertTextOnlyRequest, vectorSource };
