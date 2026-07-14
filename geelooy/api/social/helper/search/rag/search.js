// B"H

/**
 * @module SocialRagSearch
 * @chapter One Query Enters One AwtsmoosDB Vector Vessel
 * @description Orchestrates embedding, AwtsmoosDB-only vector search, comment
 * hydration, and relevance ranking without JSONL or F32 sidecars.
 */

const { resolveShard } = require('./shards.js');
const { embedQuery } = require('./llama.js');
const { joinComments } = require('./comments.js');
const { buildCommentHits } = require('./commentRelevance.js');
const { rowsForShard, searchShard } = require('./sourceSearch.js');
const { now, timed } = require('./timer.js');

async function ragSearch({
	$i,
	lane,
	query,
	limit = 10,
	includeComments = true,
	maxCommentRows = 12,
	autoInstall = true
}) {
	const timings = {};
	const totalStart = now();
	if (!query) {
		throw Object.assign(new Error('Pass q or query.'), {
			code: 'MISSING_QUERY'
		});
	}
	const shard = await timed('resolveShardMs', timings, () => resolveShard({ $i, lane }));
	if (!shard) {
		throw Object.assign(new Error('No RAG shards available.'), {
			code: 'NO_RAG_SHARDS'
		});
	}
	const embedding = await timed(
		'embeddingMs',
		timings,
		() => embedQuery({ $i, query, autoInstall })
	);
	const source = await timed(
		'searchVectorsMs',
		timings,
		() => searchShard(shard, embedding.vector, limit)
	);
	const hydrated = includeComments
		? await timed('hydrateCommentsMs', timings, () => joinComments({
			$i,
			hits: source.hits,
			maxRows: maxCommentRows
		}))
		: source.hits;
	const commentHits = includeComments
		? await timed('rankCommentsMs', timings, () => buildCommentHits(
			hydrated,
			query,
			Math.min(120, Math.max(limit * maxCommentRows, limit))
		))
		: [];
	timings.totalMs = Number((now() - totalStart).toFixed(3));
	return {
		BH: 'B"H',
		query,
		shard,
		totalRows: source.totalRows,
		vectorSource: source.source,
		engine: 'llama-local-vector-rag',
		timings,
		embedder: embedding.embedder,
		hits: hydrated,
		commentHits
	};
}

module.exports = {
	ragSearch,
	rowsForShard,
	searchShard
};
