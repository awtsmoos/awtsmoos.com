// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sourceSearch.js
 * @chapter Search Opens One AwtsmoosDB Vessel And No Textual Vector Mirror
 * @description Selects persisted HNSW when usable and otherwise scans vectors
 * already stored in AwtsmoosDB rows. JSONL and F32 sidecars are forbidden.
 */

const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const { rowsOf } = require('./shards.js');
const { sortHits, closeness } = require('./math.js');

function cleanRow(row) {
	const decoded = row || {};
	const sourceVector = decoded.vec || decoded.embedding || decoded.vector;
	const { vec, embedding, vector, text, sampleContent, previewEnglish, ...rest } = decoded;
	return {
		...rest,
		previewEnglish,
		sampleContent,
		text,
		vectorDimensions: Number(sourceVector?.length || 0)
	};
}

async function openShard(shard) {
	const database = new AwtsmoosDB(shard.file, {
		debug: false,
		wal: false,
		readOnly: true,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	await database.open();
	return database;
}

async function rowsForShard(_context, shard) {
	const database = await openShard(shard);
	try {
		const list = database.root[shard.listName];
		return {
			rows: rowsOf(list).map(row => corpusReader.decode(database, row)),
			source: 'awtsdb-list-exact'
		};
	} finally {
		await database.close?.();
	}
}

async function searchShard(shard, queryVector, limit) {
	const database = await openShard(shard);
	try {
		const list = database.root[shard.listName];
		const configured = database.vector.configurations().some(item => item.path === shard.listName);
		const status = configured ? database.vector.indexStatus(list) : null;
		if (status?.usable) return indexed(database, list, queryVector, limit);
		const rows = rowsOf(list).map(row => corpusReader.decode(database, row));
		return {
			hits: sortHits(rows, queryVector, limit).map(hit => ({ ...hit, row: cleanRow(hit.row) })),
			totalRows: rows.length,
			source: 'awtsdb-list-exact'
		};
	} finally {
		await database.close?.();
	}
}

function indexed(database, list, queryVector, limit) {
	const hits = database.vector.nearestIndexed(list, queryVector, limit);
	return {
		hits: hits.map((hit, index) => ({
			rank: index + 1,
			score: Number(hit.score.toFixed(6)),
			percent: closeness(hit.score),
			row: cleanRow(corpusReader.decode(database, hit.item))
		})),
		totalRows: Number(list.length || 0),
		source: 'awtsdb-hnsw'
	};
}

module.exports = {
	rowsForShard,
	searchShard
};
