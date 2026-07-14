// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialLibrarySearch
 * @description
 * One bounded query resolves one shard, chooses an explicit strategy, enriches
 * comments, and returns provenance that proves persisted HNSW served strict RAG.
 */

const { resolveShard } = require('./shards.js');
const { rowsForShard, searchShard } = require('./sourceSearch.js');
const { publicHit, publicShard } = require('./resultShape.js');
const { findSource } = require('./strategy.js');
const { hydrateSearch } = require('./hydrate.js');
const { emptyLibrary } = require('./emptyResult.js');
const { now, timed } = require('./timer.js');

async function ragSearch(options = {}) {
	const query = String(options.query || '').trim();
	if (!query) throw codedError('MISSING_QUERY', 'Pass q or query.');
	const timings = {};
	const totalStartedAt = now();
	const shard = await timed('resolveShardMs', timings, () => resolveShard({
		$i: options.$i,
		lane: options.lane
	}));
	if (!shard && options.requireIndexed === true) {
		throw readinessError(
			'RAG_SHARD_UNAVAILABLE',
			'No persisted indexed RAG shard is available.',
			{ requestedLane: options.lane || null }
		);
	}
	if (!shard) return emptyLibrary(query, timings, totalStartedAt, now);
	const search = await findSource({
		...options,
		query,
		shard,
		timings
	});
	assertStrictIndexed(options, shard, search);
	const comments = await hydrateSearch({
		$i: options.$i,
		hits: search.hits,
		query,
		limit: options.limit || 10,
		includeComments: options.includeComments !== false,
		maxRows: options.maxCommentRows || 12,
		timings
	});
	timings.totalMs = Number((now() - totalStartedAt).toFixed(3));
	return response({
		query,
		shard,
		search,
		hits: comments.hydrated,
		commentHits: comments.commentHits,
		timings
	});
}

function assertStrictIndexed(options, shard, search) {
	if (options.requireIndexed !== true) return;
	const valid = search.strictIndexed === true
		&& search.indexed === true
		&& search.source === 'awtsdb-hnsw-persisted'
		&& search.index?.persisted === true;
	if (valid) return;
	throw readinessError(
		'STRICT_INDEX_PROVENANCE_MISSING',
		'Strict RAG did not return persisted HNSW provenance.',
		{
			shardId: shard.id,
			vectorSource: search.source || null,
			index: search.index || null
		}
	);
}

function response(values) {
	return {
		BH: 'B"H',
		query: values.query,
		shard: publicShard(values.shard),
		mode: values.search.mode,
		strictIndexed: values.search.strictIndexed === true,
		indexed: values.search.indexed === true,
		index: values.search.index || { persisted: false },
		message: values.search.message,
		totalRows: values.search.totalRows,
		vectorSource: values.search.source,
		engine: values.search.engine,
		timings: values.timings,
		embedder: values.search.embedder,
		hits: values.hits.map(publicHit),
		commentHits: values.commentHits
	};
}

function readinessError(code, message, readiness) {
	return Object.assign(new Error(message), { code, readiness });
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	ragSearch,
	rowsForShard,
	searchShard
};
