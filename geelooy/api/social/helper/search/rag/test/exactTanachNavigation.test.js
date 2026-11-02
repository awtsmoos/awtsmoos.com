// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactTanachNavigation.test.js
 * @description Proves canonical Tanach promotion against a tiny persisted DosDB index, never workstation state.
 *
 * The Awtsmoos binds בראשית ברא to one measured verse in a sealed test ark;
 * Awtsmoos.com proves navigation from persisted bytes before semantic echoes spark.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const DosDB = require(path.resolve(__dirname, '../../../../../../../ayzarim/DosDB/index.js'));
const { normalizeHebrew, tokens } = require('../../tanach/normalize.js');
const { promoteNavigationHits } = require('../navigationPromotion.js');

const ROOT = '/search/tanach/hebrew';
const rawHebrew = 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ';
let fixtureRoot;
let previousIndex;

function shardNumber(token) {
	let hash = 0;
	for (const character of token) {
		hash = ((hash << 5) - hash + character.codePointAt(0)) | 0;
	}
	return Math.abs(hash) % 32;
}

function writeJson(database, virtualPath, value) {
	database.fs.write(virtualPath, Buffer.from(JSON.stringify(value), 'utf8'));
}

function createIndexFixture() {
	fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-tanach-index-'));
	const indexPath = path.join(fixtureRoot, 'tanach.hebrew.search.fs.awtsdb');
	const database = DosDB.awtsmoosDb(indexPath, { compression: false });
	database.fs.ready();
	for (const directory of ['/search', '/search/tanach', ROOT, `${ROOT}/verses`, `${ROOT}/token_shards`]) {
		database.fs.mkdir(directory);
	}
	const verse = {
		book: 'bereishis', bookTitle: 'Genesis', chapter: 1, verse: 1,
		rawHebrew, normalizedHebrew: normalizeHebrew(rawHebrew),
		heichelId: 'ikar', seriesId: 'bereishis', articleIndex: 0
	};
	const reference = { book: verse.book, chapter: verse.chapter, verse: verse.verse };
	writeJson(database, `${ROOT}/verses/all.json`, [verse]);
	writeJson(database, `${ROOT}/meta.json`, {
		id: 'tanach-hebrew-test', books: 1, chapters: 1, verses: 1,
		uniqueTokens: tokens(rawHebrew).length, completedAt: 'fixture'
	});
	const shards = new Map();
	for (const token of tokens(rawHebrew)) {
		const shard = shardNumber(token);
		if (!shards.has(shard)) shards.set(shard, { tokens: {} });
		shards.get(shard).tokens[token] = [reference];
	}
	for (const [shard, payload] of shards) {
		writeJson(database, `${ROOT}/token_shards/${String(shard).padStart(2, '0')}.json`, payload);
	}
	database.fs.flush();
	database.close?.();
	return indexPath;
}

previousIndex = process.env.AWTSMOOS_TANACH_INDEX;
process.env.AWTSMOOS_TANACH_INDEX = createIndexFixture();
const { eligibleExactQuery, exactTanachHits } = require('../exactTanachNavigation.js');

test.after(() => {
	if (previousIndex == null) delete process.env.AWTSMOOS_TANACH_INDEX;
	else process.env.AWTSMOOS_TANACH_INDEX = previousIndex;
	fs.rmSync(fixtureRoot, { recursive: true, force: true });
});

test('multi-word Hebrew exact query resolves Genesis 1:1 from the persisted fixture', () => {
	const hits = exactTanachHits({ query: 'בראשית ברא', limit: 3 });
	assert.equal(hits.length, 1);
	assert.equal(hits[0].source, 'canonical-tanach-exact');
	assert.equal(hits[0].row.bookId, 'bereishis');
	assert.equal(hits[0].row.chapter, 1);
	assert.equal(hits[0].row.verse, 1);
	assert.equal(hits[0].row.readerUrl, '/heichelos/ikar/series/bereishis/0?idx=0');
	assert.equal(hits[0].row.canonicalNavigation, true);
});

test('single-word searches remain broad instead of hijacking library search', () => {
	assert.equal(eligibleExactQuery('בראשית'), false);
	assert.deepEqual(exactTanachHits({ query: 'בראשית' }), []);
});

test('canonical verse is first and its semantic duplicate is removed', () => {
	const [canonical] = exactTanachHits({ query: 'בראשית ברא', limit: 1 });
	const result = promoteNavigationHits({
		hits: [
			{ id: 'duplicate', row: { readerUrl: canonical.row.readerUrl } },
			{ id: 'semantic', row: { readerUrl: '/other' } }
		],
		message: 'semantic results'
	}, [canonical], 3);
	assert.equal(result.hits[0].id, canonical.id);
	assert.equal(result.hits.some(hit => hit.id === 'duplicate'), false);
	assert.equal(result.hits[1].id, 'semantic');
});
