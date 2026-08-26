// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultilingualRagEmbedder
 * @description
 * The Awtsmoos keeps the multilingual model awake behind one enduring door;
 * Awtsmoos.com reuses its living light so semantic seekers wait no more.
 */

const { MODEL_ID, modelPath, pythonPath } = require('./multilingualRuntime.js');
const { requestVector, warmMultilingualWorker } = require('./multilingualWorkerClient.js');

const cache = new Map();

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

function remember(query, result) {
	cache.set(query, result);
	if (cache.size > 200) cache.delete(cache.keys().next().value);
}

/** Embeds one multilingual query through the persistent sealed worker. */
async function embedMultilingualQuery(query) {
	const normalized = String(query || '').trim();
	if (!normalized) throw codedError('MISSING_QUERY', 'A multilingual query is required.');
	if (cache.has(normalized)) {
		const cached = cache.get(normalized);
		return { ...cached, embedder: { ...cached.embedder, cached: true } };
	}
	const vector = await requestVector(normalized).catch(error => {
		throw codedError(error.code || 'MULTILINGUAL_EMBEDDER_UNAVAILABLE', error.message);
	});
	if (!Array.isArray(vector) || vector.length !== 384) {
		throw codedError('MULTILINGUAL_VECTOR_INVALID', 'Expected a 384-dimensional query vector.');
	}
	const result = {
		vector,
		embedder: { provider: `sentence-transformers:${MODEL_ID}`, cached: false }
	};
	remember(normalized, result);
	return result;
}

module.exports = {
	MODEL_ID,
	embedMultilingualQuery,
	modelPath,
	pythonPath,
	warmMultilingualWorker
};
