// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file strictIndexedSearch.test.js
 * @description
 * Creates a real non-indexed AwtsmoosDB shard and proves strict RAG rejects it
 * before any exact vector scan can run. The disposable vessel is closed and removed.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { searchShard } = require('../sourceSearch.js');
const { closeAllShardSessions } = require('../shardStore.js');

async function run() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-strict-rag-'));
	const file = path.join(directory, 'unindexed.awtsdb');
	let database;
	try {
		database = new AwtsmoosDB(file, { compression: false });
		database.open();
		database.createList(database.root, 'vectors');
		database.root.vectors.splice(0, 0, {
			id: 'row-1',
			vec: [1, 0, 0]
		});
		database.waitForIdle();
		database.close();
		database = null;
		await assert.rejects(
			() => searchShard({
				id: 'unindexed',
				file,
				listName: 'vectors',
				vectorEnabled: false
			}, [1, 0, 0], 1, { requireIndexed: true }),
			error => {
				assert.equal(error.code, 'INDEXED_VECTOR_SEARCH_UNAVAILABLE');
				assert.equal(error.readiness.configured, false);
				assert.equal(error.readiness.registryCount, 0);
				return true;
			}
		);
	} finally {
		if (database) database.close();
		closeAllShardSessions();
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

run().then(() => {
	console.log('strictIndexedSearch.test passed');
}).catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
