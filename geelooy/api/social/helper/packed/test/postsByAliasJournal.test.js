// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postsByAliasJournal.test.js
 * @description
 * The Awtsmoos proves that one hashed vessel survives malformed lines, tombstones, chunk seams, and path hostility;
 * Awtsmoos.com keeps derived locators bounded while canonical truth remains elsewhere.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	bucketFile,
	bucketId,
	journalActive,
	journalDirectory,
	manifestFile
} = require('../postsByAliasJournalPath.js');
const { readAliasJournalCandidates } = require('../postsByAliasJournalRead.js');
const { appendAliasJournal } = require('../postsByAliasJournalWrite.js');
const { serializeLocator } = require('../postsByAliasJournalRecord.js');

function tempRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awts-alias-journal-'));
}

function locator(alias, post, op = 'put', heichel = 'h') {
	return { v: 1, a: alias, p: post, h: heichel, o: op, t: Date.now() };
}

test('bucket paths never contain user alias text', () => {
	const root = tempRoot();
	const $i = { db: { directory: root } };
	const alias = '../../wild/alias?with=bytes';
	const file = bucketFile($i, alias);
	assert.match(bucketId(alias), /^[0-9a-f]{2}$/);
	assert.equal(path.basename(file), `${bucketId(alias)}.jsonl`);
	assert.equal(file.includes(alias), false);
});

test('inactive journal is inert and active journal appends one derived locator', () => {
	const root = tempRoot();
	const $i = { db: { directory: root } };
	const record = {
		op: 'put',
		key: '/indexes/postsByAlias/a/p1',
		value: { aliasId: 'a', postId: 'p1', heichelId: 'h1' },
		meta: { index: 'postsByAlias' },
		ts: 7
	};
	assert.equal(appendAliasJournal({ $i, shard: 'search', record }).active, false);
	assert.equal(fs.existsSync(journalDirectory($i)), false);
	fs.mkdirSync(journalDirectory($i), { recursive: true });
	fs.writeFileSync(manifestFile($i), JSON.stringify({ version: 1, active: true }));
	assert.equal(journalActive($i), true);
	assert.equal(appendAliasJournal({ $i, shard: 'search', record }).ok, true);
	const line = fs.readFileSync(bucketFile($i, 'a'), 'utf8').trim();
	assert.deepEqual(JSON.parse(line), { v: 1, a: 'a', p: 'p1', h: 'h1', o: 'put', t: 7 });
});

test('reverse reader crosses chunk boundaries and honors newest tombstones', async () => {
	const root = tempRoot();
	const file = path.join(root, 'bucket.jsonl');
	const lines = [];
	for (let index = 0; index < 6000; index += 1) {
		lines.push(serializeLocator(locator(index % 2 ? 'other' : 'a', `filler-${index}`, 'put')));
	}
	lines.push(serializeLocator(locator('a', 'survivor', 'put')));
	lines.push('{not json}\n');
	lines.push(serializeLocator(locator('a', 'gone', 'put')));
	lines.push(serializeLocator(locator('a', 'gone', 'del')));
	fs.writeFileSync(file, lines.join(''));
	const output = await readAliasJournalCandidates({ aliasId: 'a', limit: 2, fileOverride: file });
	assert.equal(output.some(item => item.p === 'gone'), false);
	assert.equal(output[0].p, 'survivor');
});

test('reader stops after bounded newest live candidates', async () => {
	const root = tempRoot();
	const file = path.join(root, 'bucket.jsonl');
	fs.writeFileSync(file, [
		serializeLocator(locator('a', 'old')),
		serializeLocator(locator('a', 'newer')),
		serializeLocator(locator('a', 'newest'))
	].join(''));
	const output = await readAliasJournalCandidates({ aliasId: 'a', limit: 2, fileOverride: file });
	assert.deepEqual(output.map(item => item.p), ['newest', 'newer']);
});
