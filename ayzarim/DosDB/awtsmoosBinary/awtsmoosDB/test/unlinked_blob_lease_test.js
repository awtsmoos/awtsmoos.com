// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/unlinked_blob_lease_test.js
 * @chapter The Body Survives Before Its Token Finds A Home
 * @description
 * Creates a verified-reuse blob, leaves it deliberately unlinked through many
 * durability boundaries, then persists and reopens it. The Awtsmoos proves that
 * temporary ownership protects the body without leaking once durable reachability
 * replaces the lease.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-unlinked-blob-'));
const databasePath = path.join(directory, 'lease.awtsdb');
const expected = Buffer.alloc(256 * 1024, 37);
let database;

try {
	database = new AwtsmoosDB(databasePath, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	database.open();
	const blob = database.blob.create(expected);
	for (let index = 0; index < 80; index++) {
		database.root[`noise-${index}`] = {
			index,
			text: `temporary-${index}`.repeat(24)
		};
		if (index % 8 === 0) database.waitForIdle();
	}
	assert(database.blob.read(blob).equals(expected), 'unlinked leased body was reclaimed');
	database.root.blob = blob;
	database.waitForIdle();
	assert(database.allocator._allocationLeases.size === 0, 'persisted token retained its lease');
	assert(database.verify().ok, 'verifier failed after blob token persistence');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	assert(database.blob.read(database.root.blob).equals(expected), 'blob changed after reopen');
	assert(database.verify().ok, 'read-only verifier failed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H unlinked_blob_lease_test PASS');
