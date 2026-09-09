// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file search_unicode_bounded.test.js
 * @description
 * The Awtsmoos proves Hebrew survives native tokenization while indexer memory
 * stays bounded. Awtsmoos.com also proves append-only immutable generation
 * indexing persists across close/reopen without any text sidecar.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const AwtsmoosDB = require('../index.js');
const tokenizer = require('../api/search/indexer/tokenizer.js');
const PhysCache = require('../api/search/indexer/physCache.js');

test('Unicode tokenizer preserves Hebrew and ignores niqqud differences', () => {
	const tokens = tokenizer.tokenize('בְּרֵאשִׁית בראשית LIGHT');
	assert.deepEqual([...tokens].sort(), ['light', 'בראשית'].sort());
	assert.equal(tokenizer.normalizeSearchText('אוֹר'), 'אור');
});

test('physical posting cache retains only a bounded token neighborhood', () => {
	const indexHandle = {};
	for (let index = 0; index < PhysCache.MAX_CACHED_TOKENS + 40; index++) {
		PhysCache.getTokenSet({}, indexHandle, `token-${index}`, null);
	}
	assert.equal(
		PhysCache.cachedTokenCount(indexHandle),
		PhysCache.MAX_CACHED_TOKENS
	);
});

/** Creates a tiny append-only generation and proves persisted Hebrew lookup. */
test('append-only native text index survives reopen', async t => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-search-unicode-'));
	const file = path.join(folder, 'search.awtsdb');
	t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
	let database = new AwtsmoosDB(file, { wal: false, compression: false });
	await database.open();
	await database.createList(database.root, 'records');
	database.search.enable(database.root.records);
	database.search.appendOnlyBuild = true;
	database.root.records.push({ id: 'a', text: 'בְּרֵאשִׁית ברא אלקים' });
	database.root.records.push({ id: 'b', text: 'ויאמר אלקים יהי אור' });
	database.root.records.push({ id: 'c', text: 'English light' });
	await database.waitForIdle();
	database.search.appendOnlyBuild = false;
	database.search.flush();
	await database.waitForIdle();
	assert.equal(database.search.runIndexed(database.root.records, 'בראשית')[0].id, 'a');
	assert.equal(database.search.runIndexed(database.root.records, 'אוֹר')[0].id, 'b');
	await database.close();

	database = new AwtsmoosDB(file, { readOnly: true, maxCachedPages: 8 });
	await database.open();
	assert.equal(database.search.runIndexed(database.root.records, 'בראשית')[0].id, 'a');
	assert.equal(database.search.runIndexed(database.root.records, 'light')[0].id, 'c');
	assert.equal(database.verify().ok, true);
	await database.close();
});
