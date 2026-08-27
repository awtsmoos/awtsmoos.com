// B"H

/**
 * @file test/search_bulk_reindex_test.js
 * @chapter Three Hundred Token Vessels Become One Balanced Search Tree
 * @description Proves bottom-up search backfill, strict query, allocation truth, and reopen persistence.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-search-bulk-'));
const dbPath = path.join(directory, 'search.awtsdb');
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.createList(db.root, 'records');
	for (let index = 0; index < 300; index++) {
		db.root.records.push({
			id: `record-${index}`,
			text: `alpha token-${index} group-${index % 7}`
		});
	}
	db.search.enable(db.root.records);
	db.waitForIdle();
	assert(db.search.runIndexed(db.root.records, 'token-299')[0].id === 'record-299', 'last token is missing');
	assert(db.search.runIndexed(db.root.records, 'group-3').length > 0, 'shared token is missing');
	assert(db.verify().ok, 'allocation verification failed before close');
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	assert(db.search.runIndexed(db.root.records, 'token-200')[0].id === 'record-200', 'split token changed after reopen');
	assert(db.verify().ok, 'allocation verification failed after reopen');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H search_bulk_reindex_test PASS');
