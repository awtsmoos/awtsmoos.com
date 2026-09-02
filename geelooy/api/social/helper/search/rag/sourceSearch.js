// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceSearch
 * @description
 * The Awtsmoos routes persisted HNSW parts through a cooperative river, while
 * flat matrices keep their exact lane; Awtsmoos.com preserves provenance and
 * lets the HTTP heart breathe between the many vessels of a multipart corpus.
 */

const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const { rowsForFlatShard, searchFlatShard } = require('./flatMatrixSearch.js');
const { closeness } = require('./math.js');
const { searchMultipart } = require('./multipartVectorSearch.js');
const { publicHit, publicRow } = require('./resultShape.js');
const { openShardSession } = require('./shardStore.js');

const DEFAULT_DIAGNOSTIC_ROWS = 128;

function cleanRow(row = {}) {
	const sourceVector = row.vec || row.embedding || row.vector;
	const { vec, embedding, vector, ...rest } = row;
	return publicRow({
		...rest,
		vectorDimensions: Number(sourceVector?.length || row.vectorDimensions || 0)
	});
}

async function rowsForShard(_context, shard, maximumRows = DEFAULT_DIAGNOSTIC_ROWS) {
	assertVectorSupported(shard);
	const limit = Math.max(0, Math.min(Number(maximumRows) || 0, 1000));
	if (shard.indexType === 'flat-f32') return rowsForFlatShard(shard, limit);
	const rows = [];
	const parts = shard.parts || [shard];
	for (const part of parts) {
		if (rows.length >= limit) break;
		const session = openShardSession(part);
		const remaining = limit - rows.length;
		const count = Math.min(Number(session.list.length || 0), remaining);
		for (let index = 0; index < count; index += 1) {
			rows.push(corpusReader.decode(session.database, session.list[index]));
		}
	}
	return {
		rows,
		source: 'awtsdb-bounded-list-read',
		truncated: rows.length >= limit
	};
}

async function searchShard(shard, queryVector, limit, options = {}) {
	assertVectorSupported(shard);
	if (shard.indexType === 'flat-f32') {
		return searchFlatShard(shard, queryVector, limit);
	}
	const parts = shard.parts || [shard];
	if (parts.length === 1) {
		return searchPhysical(parts[0], queryVector, limit, options);
	}
	return searchMultipart(
		parts,
		part => searchPhysical(part, queryVector, limit, options),
		limit
	);
}

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

module.exports = {
	assertVectorSupported,
	cleanRow,
	rowsForShard,
	searchShard,
	unavailableIndex
};
