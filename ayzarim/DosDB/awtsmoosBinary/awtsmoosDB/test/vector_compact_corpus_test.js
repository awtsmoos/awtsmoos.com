// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_compact_corpus_test.js
 * @chapter Repeated Tags Contract While Public Meaning Reopens Whole
 * @description Proves dictionary-coded metadata, detached HNSW vectors, decoded
 * search payloads, verifier integrity, and strict read-only reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const rowCodec = require('../../../aiSearch/vectorCorpus/rowCodec.js');
const corpusReader = require('../../../aiSearch/vectorCorpus/reader.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-compact-corpus-'));
const databasePath = path.join(directory, 'compact.awtsdb');
const rows = [
	{ id: 'a', corpus: 'sefer', year: 5747, aliasId: 'translation', title: 'One', text: 'alpha', vec: [1, 0, 0, 0] },
	{ id: 'b', corpus: 'sefer', year: 5747, aliasId: 'translation', title: 'Two', text: 'beta', vec: [0, 1, 0, 0] },
	{ id: 'c', corpus: 'likkutei', year: 5748, aliasId: 'translation', title: 'Three', text: 'gamma', vec: [0.9, 0.1, 0, 0] }
];
const codec = rowCodec.create(rows, ['corpus', 'year', 'aliasId']);
const encode = rowCodec.encoder(codec);
const entries = rows.map(row => ({ key: row.id, vector: row.vec, payload: encode(row) }));
let database;

try {
	database = new AwtsmoosDB(databasePath, { compression: false });
	database.open();
	database.createList(database.root, 'records');
	database.root[corpusReader.MANIFEST_KEY] = {
		version: 1,
		listName: 'records',
		dimensions: 4,
		codec
	};
	database.vector.bulkLoadDetached(database.root.records, entries, { dimensions: 4 });
	const raw = database.root.records[0];
	assert(rowCodec.isCompact(raw), 'payload was not compact encoded');
	const decodedRaw = rowCodec.decode(codec, raw);
	assert(decodedRaw.vec === undefined && decodedRaw.corpus === 'sefer', 'payload retained a vector or lost a tag');
	const hits = corpusReader.decodeHits(database, database.vector.nearestIndexed(database.root.records, [1, 0, 0, 0], 2));
	assert(hits[0].item.id === 'a' && hits[1].item.id === 'c', 'decoded indexed ordering changed');
	assert(hits[0].item.corpus === 'sefer' && hits[0].item.year === 5747, 'decoded tags changed');
	assert(codec.tags.dictionaries.corpus.length === 2, 'corpus dictionary cardinality changed');
	assert(codec.tags.dictionaries.aliasId.length === 1, 'alias dictionary did not collapse repetition');
	assert(database.vector.auditIndex(database.root.records).ok, 'compact corpus graph audit failed');
	assert(database.verify().ok, 'compact corpus verification failed');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	const reopened = corpusReader.decodeHits(database, database.vector.nearestIndexed(database.root.records, [1, 0, 0, 0], 2));
	assert(reopened[0].item.id === 'a' && reopened[0].item.aliasId === 'translation', 'reopened compact payload changed');
	assert(database.vector.entries(database.root.records).length === rows.length, 'reopened compact vectors changed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_compact_corpus_test PASS');
