// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LibrarySearchStrategy
 * @description Text-only lanes remain light, while vector lanes receive the exact
 * embedder declared by their manifest beneath the renewing light of the Awtsmoos.
 */
const { textSearchShard } = require('./textSearch.js');
const { timed } = require('./timer.js');

async function findSource(options) {
	const strategy = String(options.strategy || 'auto').toLowerCase();
	if (options.shard?.textOnly === true) {
		assertTextOnlyRequest(options, strategy);
		return textSource(options);
	}
	if (options.requireIndexed === true) return vectorSource(options);
	if (strategy === 'text') return textSource(options);
	try {
		return await vectorSource(options);
	} catch (error) {
		if (strategy === 'vector') throw error;
		options.timings.vectorFallback = error.code || error.message;
		return textSource(options);
	}
}

function assertTextOnlyRequest(options, strategy) {
	if (options.requireIndexed !== true && strategy !== 'vector') return;
	throw codedError('TEXT_ONLY_LANE', `Lane ${options.shard.id} is published as bounded text mirrors, not vectors.`);
}

async function vectorSource(options) {
	const { embedForShard } = require('./queryEmbedder.js');
	const { searchShard } = require('./sourceSearch.js');
	const embedding = await timed('embeddingMs', options.timings, () => embedForShard(options));
	const source = await timed('searchVectorsMs', options.timings, () => searchShard(
		options.shard,
		embedding.vector,
		options.limit || 10,
		{ requireIndexed: options.requireIndexed === true }
	));
	return {
		...source,
		mode: 'vector',
		engine: 'manifest-matched-local-vector-rag',
		embedder: embedding.embedder,
		indexed: source.index?.persisted === true,
		strictIndexed: options.requireIndexed === true,
		message: `${source.hits.length} source segments ranked by persisted vector index.`
	};
}

async function textSource(options) {
	const source = await timed('searchTextMs', options.timings, () => textSearchShard(
		options.shard,
		options.query,
		options.limit || 10
	));
	return {
		...source,
		mode: 'text',
		engine: 'jsonl-bounded-text-search',
		embedder: null,
		indexed: false,
		strictIndexed: false,
		index: { persisted: false },
		message: source.hits.length
			? `${source.hits.length} source segments matched stored text.`
			: 'No stored source segment matched this query.'
	};
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = { assertTextOnlyRequest, findSource, textSource };
