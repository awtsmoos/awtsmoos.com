// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialLibrarySearch
 * @description
 * One bounded query proves canonical storage, resolves one shard, chooses one
 * explicit strategy, enriches comments, and returns persisted-HNSW provenance.
 * Only a final public no-comment response may enter bounded process memory.
 */

const { resolveShard } = require('./shards.js');
const { rowsForShard, searchShard } = require('./sourceSearch.js');
const { findSource } = require('./strategy.js');
const { hydrateSearch } = require('./hydrate.js');
const { emptyLibrary } = require('./emptyResult.js');
const { now, timed } = require('./timer.js');
const {
	readCachedResponse,
	rememberResponse
} = require('./responseCache.js');
const {
	buildResponse,
	cachedResponse,
	codedError,
	readinessError
} = require('./searchResponse.js');
const {
	assertStorageUnchanged,
	captureCanonicalStorage
} = require('./storageInvariant.js');

async function ragSearch(options = {}) {
	const query = String(options.query || '').trim();
	if (!query) throw codedError('MISSING_QUERY', 'Pass q or query.');
	const request = { ...options, query };
	const timings = {};
	const totalStartedAt = now();
	const storageBefore = captureCanonicalStorage(options.$i);
	const shard = await timed('resolveShardMs', timings, () => resolveShard({
		$i: options.$i,
		lane: options.lane
	}));
	if (!shard) return missingShard(request, timings, totalStartedAt, storageBefore);
	const cached = readCachedResponse(request, shard, storageBefore);
	if (cached) {
		assertStorageUnchanged(
			storageBefore,
			captureCanonicalStorage(options.$i)
		);
		return cachedResponse(cached, timings, totalStartedAt, now);
	}
	const search = await findSource({
		...request,
		shard,
		timings
	});
	assertStrictIndexed(request, shard, search);
	const comments = await hydrateSearch({
		$i: options.$i,
		hits: search.hits,
		query,
		limit: options.limit || 10,
		includeComments: options.includeComments === true,
		maxRows: options.maxCommentRows || 12,
		timings
	});
	timings.totalMs = Number((now() - totalStartedAt).toFixed(3));
	const result = buildResponse({
		query,
		shard,
		search,
		hits: comments.hydrated,
		commentHits: comments.commentHits,
		timings
	});
	assertStorageUnchanged(storageBefore, captureCanonicalStorage(options.$i));
	if (result.index.persisted === true) {
		rememberResponse(request, shard, storageBefore, result);
	}
	return result;
}

function missingShard(options, timings, startedAt, storageBefore) {
	if (options.requireIndexed === true) {
		throw readinessError(
			'RAG_SHARD_UNAVAILABLE',
			'No persisted indexed RAG shard is available.',
			{ requestedLane: options.lane || null }
		);
	}
	assertStorageUnchanged(storageBefore, captureCanonicalStorage(options.$i));
	return emptyLibrary(options.query, timings, startedAt, now);
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

module.exports = {
	ragSearch,
	rowsForShard,
	searchShard
};