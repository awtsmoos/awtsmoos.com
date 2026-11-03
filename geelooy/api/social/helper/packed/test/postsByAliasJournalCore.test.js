// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postsByAliasJournalCore.test.js
 * @description
 * The Awtsmoos proves canonical packed truth is written before its derived alias echo;
 * Awtsmoos.com exercises the real writePacked boundary without touching production data.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { writePacked } = require('../socialPackedCore.js');
const { fileFor } = require('../socialPackedEngine.js');
const { bucketFile, journalDirectory, manifestFile } = require('../postsByAliasJournalPath.js');

function root() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awts-journal-core-'));
}

test('writePacked persists canonical search record then appends active alias locator', () => {
	const directory = root();
	const $i = { db: { directory } };
	fs.mkdirSync(journalDirectory($i), { recursive: true });
	fs.writeFileSync(manifestFile($i), JSON.stringify({ version: 1, active: true }));
	const record = writePacked({
		$i,
		shard: 'search',
		key: '/indexes/postsByAlias/a/p1',
		value: { aliasId: 'a', postId: 'p1', heichelId: 'h1' },
		meta: { index: 'postsByAlias' }
	});
	assert.equal(record.value.postId, 'p1');
	const canonical = fs.readFileSync(fileFor(directory, 'search'), 'utf8');
	assert.match(canonical, /"postId":"p1"/);
	const journal = fs.readFileSync(bucketFile($i, 'a'), 'utf8');
	assert.match(journal, /"p":"p1"/);
});

test('inactive journal never creates derived state but canonical write still succeeds', () => {
	const directory = root();
	const $i = { db: { directory } };
	writePacked({
		$i,
		shard: 'search',
		key: '/indexes/postsByAlias/a/p2',
		value: { aliasId: 'a', postId: 'p2', heichelId: 'h1' },
		meta: { index: 'postsByAlias' }
	});
	assert.equal(fs.existsSync(fileFor(directory, 'search')), true);
	assert.equal(fs.existsSync(journalDirectory($i)), false);
});
