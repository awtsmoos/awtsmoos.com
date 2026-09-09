// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LexiconBrowseTest
 * @description
 * The Awtsmoos proves alphabet, sparse ranges, duplicate headwords, and opaque continuation over real AwtsmoosDB fixture shards;
 * Awtsmoos.com therefore tests the same bounded binary path production serves rather than a JSON-shaped imitation.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createFixtureDatabase } = require('./fixtureDatabase.js');

/** Runs one test against an isolated native lexicon generation and restores process configuration. */
async function withFixture(run) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-lexicon-browse-'));
	const previous = process.env.AWTSMOOS_LEXICON_ROOT;
	try {
		await createFixtureDatabase(root);
		process.env.AWTSMOOS_LEXICON_ROOT = root;
		await run();
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_LEXICON_ROOT;
		else process.env.AWTSMOOS_LEXICON_ROOT = previous;
		await fs.rm(root, { recursive: true, force: true });
	}
}

/** Returns the fixture's Hebrew bet shard token without hardcoding storage internals in assertions. */
function betToken() {
	return '05d1';
}

test('alphabet and sparse ranges come from native shard testimony', async () => {
	await withFixture(async () => {
		const { dictionaryAlphabet, dictionaryRanges } = require('../browse.js');
		const alphabet = await dictionaryAlphabet({});
		assert.equal(alphabet.available, true);
		assert.deepEqual(alphabet.letters, [{ token: betToken(), letter: 'ב', count: 3 }]);
		const ranges = await dictionaryRanges({}, { token: betToken() });
		assert.equal(ranges.letter, 'ב');
		assert.ok(ranges.ranges.some(range => range.start === 'בראשית'));
		assert.ok(ranges.ranges.length <= 64);
	});
});

test('merged browse continues duplicate headwords by source without repeating rows', async () => {
	await withFixture(async () => {
		const { dictionaryBrowse } = require('../browse.js');
		const first = await dictionaryBrowse({}, { token: betToken(), limit: 1 });
		assert.equal(first.entries.length, 1);
		assert.equal(first.entries[0].headword, 'בראשית');
		assert.equal(first.entries[0].source.id, 'bdb');
		assert.ok(first.cursor);
		const second = await dictionaryBrowse({}, { token: betToken(), cursor: first.cursor, limit: 1 });
		assert.equal(second.entries[0].headword, 'בראשית');
		assert.equal(second.entries[0].source.id, 'yiddish-wiktionary');
		const third = await dictionaryBrowse({}, { token: betToken(), cursor: second.cursor, limit: 1 });
		assert.equal(third.entries[0].headword, 'בראשיתיות');
		assert.equal(third.hasMore, false);
	});
});

test('source filtering and invalid cursors remain bounded and explicit', async () => {
	await withFixture(async () => {
		const { dictionaryBrowse } = require('../browse.js');
		const filtered = await dictionaryBrowse({}, {
			token: betToken(),
			sourceId: 'yiddish-wiktionary',
			limit: 4
		});
		assert.deepEqual(filtered.entries.map(entry => entry.source.id), ['yiddish-wiktionary']);
		await assert.rejects(
			() => dictionaryBrowse({}, { token: betToken(), cursor: 'not-a-valid-cursor' }),
			error => error?.code === 'INVALID_LEXICON_CURSOR'
		);
	});
});
