// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceSearch
 * @description
 * One query vector may cross several reviewed physical vessels. Their persisted
 * HNSW answers are merged by distance into one truthful Awtsmoos.com result lane.
 */

const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const { rowsOf } = require('./shards.js');
const { sortHits, closeness } = require('./math.js');
const { publicHit, publicRow } = require('./resultShape.js');
const { openShardSession } = require('./shardStore.js');

function cleanRow(row = {}) {
	const sourceVector = row.vec || row.embedding || row.vector;
	const { vec, embedding, vector, ...rest } = row;
	return publicRow({ ...rest, vectorDimensions: Number(sourceVector?.length || row.vectorDimensions || 0) });
}

async function rowsForShard(_context, shard) {
	const parts = shard.parts || [shard];
	const rows = parts.flatMap(part => {
		const session = openShardSession(part);
		return rowsOf(session.list).map(row => corpusReader.decode(session.database, row));
	});
	return { rows, source: 'awtsdb-list-read', sessionReused: false };
}

async function searchShard(shard, queryVector, limit, options = {}) {
	const parts = shard.parts || [shard];
	const searches = parts.map(part => searchPhysical(part, queryVector, limit, options));
	const results = await Promise.all(searches);
	if (results.length === 1) return results[0];
	const hits = results.flatMap(result => result.hits)
		.sort((left, right) => Number(left.score) - Number(right.score))
		.slice(0, limit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	return {
		hits,
		totalRows: results.reduce((sum, result) => sum + result.totalRows, 0),
		source: 'awtsdb-hnsw-persisted',
		index: {
			persisted: results.every(result => result.index?.persisted === true),
			registryCount: results.reduce((sum, result) => sum + Number(result.index?.registryCount || 0), 0),
			parts: results.length,
			sessionReused: results.every(result => result.index?.sessionReused === true)
		}
	};
}

function searchPhysical(shard, queryVector, limit, options) {
	const session = openShardSession(shard);
	if (session.status.usable) return indexed(session, queryVector, limit);
	if (options.requireIndexed === true) throw unavailableIndex(shard, session.status);
	return exact(session, queryVector, limit);
}

function indexed(session, queryVector, limit) {
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
		index: { persisted: true, registryCount: session.status.registryCount, sessionReused: session.reused }
	};
}

function exact(session, queryVector, limit) {
	const rows = rowsOf(session.list).map(row => corpusReader.decode(session.database, row));
	return {
		hits: sortHits(rows, queryVector, limit).map((hit, index) => publicHit({ ...hit, row: cleanRow(hit.row) }, index)),
		totalRows: rows.length,
		source: 'awtsdb-vector-exact',
		index: { persisted: false, sessionReused: session.reused }
	};
}

function unavailableIndex(shard, status) {
	return Object.assign(new Error(`Persisted HNSW is unavailable for shard ${shard.id}.`), {
		code: 'INDEXED_VECTOR_SEARCH_UNAVAILABLE',
		readiness: { shardId: shard.id, registryCount: status.registryCount }
	});
}

module.exports = { cleanRow, rowsForShard, searchShard, unavailableIndex };
