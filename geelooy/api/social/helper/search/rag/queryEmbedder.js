// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module QueryEmbedderRouter
 * @description
 * The Awtsmoos routes each lane to its matching vector covenant: a shard
 * declaring bge-small-en-v1.5 is embedded with the sealed BGE GGUF, a shard
 * declaring the multilingual e5 model keeps its own worker, and everything
 * else falls back to the local llama embedder. Hebrew-script queries never
 * reach this router — queryLanguagePolicy keeps them lexical.
 */
const { BGE_MODEL_ID, embedBgeQuery } = require('./bgeEmbedder.js');
const { embedMultilingualQuery, MODEL_ID: E5_MODEL_ID } = require('./multilingualEmbedder.js');

/**
 * Names the embedder lane for one shard descriptor without awakening any
 * worker: 'bge' for bge-small-en-v1.5 shards, 'multilingual-e5' for legacy
 * e5 shards, 'llama' otherwise.
 */
function embedderFor(shard = {}) {
	const model = shard?.embeddingModel;
	if (model === BGE_MODEL_ID) return 'bge';
	if (model === E5_MODEL_ID) return 'multilingual-e5';
	return 'llama';
}

async function embedForShard(options) {
	const choice = embedderFor(options.shard);
	if (choice === 'bge') return embedBgeQuery(options.query);
	if (choice === 'multilingual-e5') return embedMultilingualQuery(options.query);
	const { embedQuery } = require('./llama.js');
	return embedQuery({
		$i: options.$i,
		query: options.query,
		autoInstall: options.autoInstall === true
	});
}

module.exports = { embedForShard, embedderFor };
