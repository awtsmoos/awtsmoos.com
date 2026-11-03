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
			requireIndexed: options.requireIndexed === true
		}));
	});
	options.timings.sourceCacheHit = source.sourceCacheHit === true;
	const { searchPendingVectors, mergePendingHits } = require('./pendingCommentVectors.js');
	let hits = source.hits;
	try {
		const pending = await searchPendingVectors({
			$i: options.$i,
			queryVector: embedding.vector,
			limit
		});
		hits = mergePendingHits(source.hits, pending, limit);
	} catch (_error) {}
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
