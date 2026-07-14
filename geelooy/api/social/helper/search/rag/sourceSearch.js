// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceSearch
 * @description
 * A selected shard remains open read-only across warm queries. Strict RAG accepts
 * only its persisted HNSW graph; exact vector ranking remains an explicit generic
 * library mode and can never masquerade as indexed retrieval.
 */

const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const { rowsOf } = require('./shards.js');
const { sortHits, closeness } = require('./math.js');
const { publicHit, publicRow } = require('./resultShape.js');
const { openShardSession } = require('./shardStore.js');

function cleanRow(row = {}) {
	const sourceVector = row.vec || row.embedding || row.vector;
	const { vec, embedding, vector, ...rest } = row;
	return publicRow({
		...rest,
		vectorDimensions: Number(sourceVector?.length || row.vectorDimensions || 0)
	});
}

async function rowsForShard(_context, shard) {
	const session = openShardSession(shard);
	return {
		rows: rowsOf(session.list).map(row => corpusReader.decode(session.database, row)),
		source: 'awtsdb-list-read',
		sessionReused: session.reused
	};
}

async function searchShard(shard, queryVector, limit, options = {}) {
	const session = openShardSession(shard);
	if (session.status.usable) {
		return indexed(session, queryVector, limit);
	}
	if (options.requireIndexed === true) {
		throw unavailableIndex(shard, session.status);
	}
	return exact(session, queryVector, limit);
}

function indexed(session, queryVector, limit) {
	const hits = session.database.vector.nearestIndexed(
		session.list,
		queryVector,
		limit
	);
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
			entryNodeID: session.status.entryNodeID,
			maxLevel: session.status.maxLevel,
			sessionReused: session.reused
		}
	};
}

function exact(session, queryVector, limit) {
	const rows = rowsOf(session.list).map(row => corpusReader.decode(session.database, row));
	return {
		hits: sortHits(rows, queryVector, limit).map((hit, index) => publicHit({
			...hit,
			row: cleanRow(hit.row)
		}, index)),
		totalRows: rows.length,
		source: 'awtsdb-vector-exact',
		index: {
			persisted: false,
			sessionReused: session.reused
		}
	};
}

function unavailableIndex(shard, status) {
	const error = new Error(`Persisted HNSW is unavailable for shard ${shard.id}.`);
	error.code = 'INDEXED_VECTOR_SEARCH_UNAVAILABLE';
	error.readiness = {
		shardId: shard.id,
		listName: shard.listName,
		configured: status.configured,
		registryCount: status.registryCount,
		entryNodeID: status.entryNodeID,
		maxLevel: status.maxLevel,
		vectorEnabled: shard.vectorEnabled === true
	};
	return error;
}

module.exports = {
	cleanRow,
	rowsForShard,
	searchShard,
	unavailableIndex
};
