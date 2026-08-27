// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vector_reindex_sequence_iterator_test.js
 * @chapter One Multi-Leaf Source Walk Must Preserve Every Canonical Row In Order
 * @description
 * Builds a disposable sequence large enough to span branches, then proves the
 * one-pass reindex source iterator yields every pointer exactly once and in order.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const constants = require('../constants.js');
const AwtsmoosDB = require('../index.js');
const createSourceIterator = require('../api/vector/reindex/sourceIterator.js');
const resolveRecord = require('../api/vector/reindex/recordResolver.js');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-reindex-source-'));
const file = path.join(directory, 'source.awtsdb');
const expected = Array.from({ length: 640 }, (_, id) => ({
	id,
	text: `row-${id}`,
	vec: [id / 640, 1 - id / 640, id % 7, id % 11]
}));

function build() {
	const database = new AwtsmoosDB(file, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	try {
		database.open();
		database.createList(database.root, 'records');
		database.root.records.splice(0, 0, ...expected);
		database.waitForIdle();
	} finally {
		database.close();
	}
}

function prove() {
	const database = new AwtsmoosDB(file, { readOnly: true });
	try {
		database.open();
		const list = database.root.records;
		const soul = list[constants.SYMBOLS.INTERNALS];
		soul.ensureResolved(true);
		const iterator = createSourceIterator(database, soul);
		assert(iterator);
		let count = 0;
		for (const row of iterator) {
			assert.equal(row.key, count);
			const record = resolveRecord(database, row.pointer, row.value);
			assert.equal(record.id, count);
			assert.equal(record.text, `row-${count}`);
			count++;
		}
		assert.equal(count, expected.length);
	} finally {
		database.close();
	}
}

try {
	build();
	prove();
	console.log('vector_reindex_sequence_iterator_test passed');
} finally {
	fs.rmSync(directory, { recursive: true, force: true });
}
