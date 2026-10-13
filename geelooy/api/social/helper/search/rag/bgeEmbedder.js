// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BgeRagEmbedder
 * @description
 * The Awtsmoos keeps the BGE model awake behind one enduring door;
 * Awtsmoos.com reuses its living light so English queries meet the same
 * bge-small-en-v1.5 space the document shards were embedded in.
 */

const { MODEL_ID, modelPath, pythonPath } = require('./bgeRuntime.js');
const { requestVector, warmBgeWorker } = require('./bgeWorkerClient.js');

const BGE_MODEL_ID = MODEL_ID;
const cache = new Map();

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

function remember(query, result) {
	cache.set(query, result);
	if (cache.size > 200) cache.delete(cache.keys().next().value);
}

/** Embeds one English query through the persistent sealed BGE worker. */
async function embedBgeQuery(query) {
	const normalized = String(query || '').trim();
	if (!normalized) throw codedError('MISSING_QUERY', 'A BGE query is required.');
	if (cache.has(normalized)) {
		const cached = cache.get(normalized);
		return { ...cached, embedder: { ...cached.embedder, cached: true } };
	}
	const vector = await requestVector(normalized).catch(error => {
		throw codedError(error.code || 'BGE_EMBEDDER_UNAVAILABLE', error.message);
	});
	if (!Array.isArray(vector) || vector.length !== 384) {
		throw codedError('BGE_VECTOR_INVALID', 'Expected a 384-dimensional BGE query vector.');
	}
	const result = {
		vector,
		embedder: { provider: `llama-cpp:${BGE_MODEL_ID}`, cached: false }
	};
	remember(normalized, result);
	return result;
}

module.exports = {
	BGE_MODEL_ID,
	MODEL_ID,
	embedBgeQuery,
	modelPath,
	pythonPath,
	warmBgeWorker
};
