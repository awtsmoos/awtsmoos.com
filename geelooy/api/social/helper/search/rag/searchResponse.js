// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagSearchResponse
 * @description
 * The Awtsmoos seals one public answer while operational roots remain concealed;
 * Awtsmoos.com reveals provider truth, index proof, and safe results alone in the field.
 */

const { publicHit, publicShard } = require('./resultShape.js');

function publicEmbedder(embedder) {
	if (!embedder) return null;
	return {
		provider: embedder.provider || null,
		cached: embedder.cached === true,
		ready: embedder.ready
			? {
				available: embedder.ready.available !== false,
				installed: embedder.ready.installed === true
			}
			: undefined
	};
}

function buildResponse(values) {
	return {
		BH: 'B"H',
		query: values.query,
		shard: publicShard(values.shard),
		mode: values.search.mode,
		strictIndexed: values.search.strictIndexed === true,
		indexed: values.search.indexed === true,
		index: {
			...(values.search.index || { persisted: false }),
			responseCacheHit: false
		},
		message: values.search.message,
		totalRows: values.search.totalRows,
		vectorSource: values.search.source,
		engine: values.search.engine,
		timings: values.timings,
		embedder: publicEmbedder(values.search.embedder),
		hits: values.hits.map(publicHit),
		commentHits: values.commentHits
	};
}

function cachedResponse(entry, timings, totalStartedAt, now) {
	const value = entry.value;
	value.index = {
		...(value.index || {}),
		responseCacheHit: true
	};
	value.timings = {
		...timings,
		responseCacheAgeMs: Number(entry.ageMs || 0),
		responseCacheHit: true,
		totalMs: Number((now() - totalStartedAt).toFixed(3))
	};
	return value;
}

function readinessError(code, message, readiness) {
	return Object.assign(new Error(message), { code, readiness });
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	buildResponse,
	cachedResponse,
	codedError,
	publicEmbedder,
	readinessError
};
