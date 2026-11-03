//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SourceSearch
 * @description
 * The Awtsmoos gathers persisted HNSW sparks across bounded workers, sparing the one server breath;
 * Awtsmoos.com preserves exact provenance and a sequential fallback should workers meet their depth.
 */

const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const { rowsForFlatShard, searchFlatShard } = require('./flatMatrixSearch.js');
const { searchParallelParts } = require('./indexedParallelSearch.js');
const { closeness } = require('./math.js');
const { searchMultipart } = require('./multipartVectorSearch.js');
const { publicHit, publicRow } = require('./resultShape.js');
const { openShardSession } = require('./shardStore.js');

const DEFAULT_DIAGNOSTIC_ROWS = 128;

/** Removes private embeddings while reporting public source dimensions. */
function cleanRow(row = {}) {
	const sourceVector = row.vec || row.embedding || row.vector;
	const { vec, embedding, vector, ...rest } = row;
	return publicRow({
		...rest,
		vectorDimensions: Number(sourceVector?.length || row.vectorDimensions || 0)
	});
}

/** Collects a bounded number of exact source rows for diagnostics. */
async function rowsForShard(_context, shard, maximumRows = DEFAULT_DIAGNOSTIC_ROWS) {
	assertVectorSupported(shard);
	const limit = Math.max(0, Math.min(Number(maximumRows) || 0, 1000));
	if (shard.indexType === 'flat-f32') return rowsForFlatShard(shard, limit);
	const rows = [];
	for (const part of shard.parts || [shard]) {
		if (rows.length >= limit) break;
		const session = openShardSession(part);
		const count = Math.min(Number(session.list.length || 0), limit - rows.length);
		for (let index = 0; index < count; index += 1) {
			rows.push(corpusReader.decode(session.database, session.list[index]));
		}
	}
	return { rows, source: 'awtsdb-bounded-list-read', truncated: rows.length >= limit };
}

/** Dispatches multipart persisted index work to threads without changing merge order. */
async function searchShard(shard, queryVector, limit, options = {}) {
	assertVectorSupported(shard);
	if (shard.indexType === 'flat-f32') return searchFlatShard(shard, queryVector, limit);
	const parts = shard.parts || [shard];
	if (parts.length === 1) return searchPhysical(parts[0], queryVector, limit);
	if (options.useWorkerPool !== false) {
		try {
			return await searchParallelParts(parts, queryVector, limit);
		} catch (error) {
			if (error.code !== 'INDEX_WORKER_UNAVAILABLE') throw error;
		}
	}
	return searchMultipart(parts, part => searchPhysical(part, queryVector, limit), limit);
}

/** Executes one authoritative persisted nearest-neighbor lookup. */
function searchPhysical(shard, queryVector, limit) {
	const session = openShardSession(shard);
	if (!session.status.usable) throw unavailableIndex(shard, session.status);
	const hits = session.database.vector.nearestIndexed(session.list, queryVector, limit);
	return {
		hits: hits.map((hit, index) => publicHit({
			rank: index + 1,
			score: hit.score,
			percent: closeness(hit.score),
			row: cleanRow(corpusReader.decode(session.database, hit.item))
		}, index)),
		totalRows: Number(session.list.length || 0),
		source: 'awtsdb-hnsw-persisted',
		index: {
			persisted: true,
			registryCount: session.status.registryCount,
			sessionReused: session.reused
		}
	};
}

function assertVectorSupported(shard = {}) {
	if (shard.textOnly !== true && shard.partial !== true) return;
	throw Object.assign(new Error(`Shard ${shard.id} is a partial text-only publication.`), {
		code: 'PARTIAL_LANE_TEXT_ONLY'
	});
}

function unavailableIndex(shard, status) {
	return Object.assign(new Error(`Persisted HNSW is unavailable for shard ${shard.id}.`), {
		code: 'INDEXED_VECTOR_SEARCH_UNAVAILABLE',
		readiness: {
			shardId: shard.id,
			configured: status.configured,
			registryCount: status.registryCount,
			entryNodeID: status.entryNodeID
		}
	});
}

module.exports = { assertVectorSupported, cleanRow, rowsForShard, searchShard, unavailableIndex };
