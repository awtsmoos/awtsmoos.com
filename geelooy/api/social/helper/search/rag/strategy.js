// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchStrategy
 * @description
 * Strict RAG follows one road only: a real query embedding into a persisted HNSW
 * graph. Generic library search may choose text or explicit exact ranking, but no
 * fallback can borrow the name or provenance of indexed retrieval.
 */

const { embedQuery } = require('./llama.js');
const { searchShard } = require('./sourceSearch.js');
const { textSearchShard } = require('./textSearch.js');
const { timed } = require('./timer.js');

async function findSource(options) {
	if (options.requireIndexed === true) return vectorSource(options);
	const strategy = String(options.strategy || 'auto').toLowerCase();
	if (strategy !== 'text') {
		try {
			return await vectorSource(options);
		} catch (error) {
			if (strategy === 'vector') throw error;
			options.timings.vectorFallback = error.code || error.message;
		}
	}
	return textSource(options);
}

async function vectorSource(options) {
	const embedding = await timed(
		'embeddingMs',
		options.timings,
		() => embedQuery({
			$i: options.$i,
			query: options.query,
			autoInstall: options.autoInstall === true
		})
	);
	const source = await timed(
		'searchVectorsMs',
		options.timings,
		() => searchShard(
			options.shard,
			embedding.vector,
			options.limit || 10,
			{ requireIndexed: options.requireIndexed === true }
		)
	);
	return {
		...source,
		mode: 'vector',
		engine: 'llama-local-vector-rag',
		embedder: embedding.embedder,
		indexed: source.index?.persisted === true,
		strictIndexed: options.requireIndexed === true,
		message: `${source.hits.length} source segments ranked by persisted vector index.`
	};
}

async function textSource(options) {
	const source = await timed(
		'searchTextMs',
		options.timings,
		() => textSearchShard(
			options.shard,
			options.query,
			options.limit || 10
		)
	);
	return {
		...source,
		mode: 'text',
		engine: 'awtsdb-text-search',
		embedder: null,
		indexed: false,
		strictIndexed: false,
		index: { persisted: false },
		message: source.hits.length
			? `${source.hits.length} source segments matched stored text.`
			: 'No stored source segment matched this query.'
	};
}

module.exports = {
	findSource
};
