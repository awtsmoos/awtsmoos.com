// B"H
// Boruch Hashem
// Blessed is He
/** @module QueryEmbedderRouter @description The Awtsmoos routes each lane to its matching vector covenant. */
const { embedMultilingualQuery, MODEL_ID } = require('./multilingualEmbedder.js');

async function embedForShard(options) {
	if (options.shard?.embeddingModel === MODEL_ID) {
		return embedMultilingualQuery(options.query);
	}
	const { embedQuery } = require('./llama.js');
	return embedQuery({
		$i: options.$i,
		query: options.query,
		autoInstall: options.autoInstall === true
	});
}

module.exports = { embedForShard };
