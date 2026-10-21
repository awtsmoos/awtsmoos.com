//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module strategyVector
 * @description
 * English semantic vector source execution and text-only lane refusal.
 */

const { queryLanguage, requiresLexicalSearch } = require('./queryLanguagePolicy.js');
const { assertEnglishSemanticCorpus } = require('./semanticCorpusPolicy.js');
const { textSearchShard } = require('./textSearch.js');
const { timed } = require('./timer.js');

const { codedError } = require('./strategyText.js');

/** Refuses false vector claims for physical generations published as text-only. */
function assertTextOnlyRequest(options, strategy) {
	if (options.requireIndexed !== true && strategy !== 'vector') return;
	throw codedError(
		'TEXT_ONLY_LANE',
		`Lane ${options.shard.id} is published as bounded text mirrors, not vectors.`
	);
}

/** Executes the custom English semantic lane only after query and corpus policy permit it. */
async function vectorSource(options) {
	assertEnglishSemanticCorpus(options.shard);
	const { embedForShard } = require('./queryEmbedder.js');
	const { searchShard } = require('./sourceSearch.js');
	const embedding = await timed('embeddingMs', options.timings, () => embedForShard(options));
	const source = await timed('searchVectorsMs', options.timings, () => searchShard(
		options.shard,
		embedding.vector,
		options.limit || 10,
		{ requireIndexed: options.requireIndexed === true }
	));
	// Pending comment vectors: newly imported comments surface in semantic
	// search at query time, before a persisted shard absorbs them (best-effort).
	const { searchPendingVectors, mergePendingHits } = require('./pendingCommentVectors.js');
	let pendingMergedHits = source.hits;
	try {
		const pending = await searchPendingVectors({ $i: options.$i, queryVector: embedding.vector, limit: options.limit || 10 });
		pendingMergedHits = mergePendingHits(source.hits, pending, options.limit || 10);
	} catch (_) {}
	return {
		...source,
		hits: pendingMergedHits,
		mode: 'vector',
		queryLanguage: queryLanguage(options.query),
		engine: 'custom-english-semantic-vector-search',
		embedder: embedding.embedder,
		indexed: source.index?.persisted === true,
		strictIndexed: options.requireIndexed === true,
		message: `${source.hits.length} English source segments ranked semantically.`
	};
}

module.exports = {
	assertTextOnlyRequest,
	vectorSource
};
