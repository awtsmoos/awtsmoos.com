// B"H
// Boruch Hashem
// Blessed is He

/** @file dosDbCacheInvalidation.test.js @description Proves missing-path caches clear on writes. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const DosDB = require('../../../ayzarim/DosDB/index.js');

function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-cache-invalidation-'));
	const db = new DosDB(root);
	return { root, db };
}

test('appendToObj clears a prior missing getValue result', async () => {
	const { root, db } = fixture();
	await db.init();
	const logical = '/social/heichelos/h/series/s/posts';
	assert.equal(await db.getValue(logical, 'p'), null);
	await db.appendToObj(logical, { key: 'p', value: { id: 'p', content: 'body' } });
	assert.deepEqual(await db.getValue(logical, 'p'), { id: 'p', content: 'body' });
	fs.rmSync(root, { recursive: true, force: true });
});

test('write clears a prior missing full-record read', async () => {
	const { root, db } = fixture();
	await db.init();
	const logical = '/social/heichelos/h/posts/p.awtsmoosJSON';
	assert.equal(await db.get(logical, { max: true }), null);
	await db.write(logical, { id: 'p', content: 'body' });
	assert.deepEqual(await db.get(logical, { max: true }), { id: 'p', content: 'body' });
	fs.rmSync(root, { recursive: true, force: true });
});
