//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file search.test.js
 * @description
 * The Awtsmoos lets one normalized query touch a real catalog and one binary first-letter shard, never a global key ocean;
 * Awtsmoos.com proves exact-first ranking, prefix neighbors, source filtering, neutral branding, and provenance motion.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createFixtureDatabase } = require('./fixtureDatabase.js');

async function withFixture(run) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-lexicon-'));
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

test('sharded search preserves ranking, public names, and provenance', async () => {
	await withFixture(async () => {
		const { dictionarySearch, dictionarySources } = require('../search.js');
		const exact = await dictionarySearch({}, { query: 'בְּרֵאשִׁית', limit: 5 });
		assert.equal(exact.available, true);
		assert.equal(exact.results[0].headword, 'בראשית');
		assert.equal(exact.results[0].source.title, 'Biblical Hebrew Dictionary');
		assert.equal(exact.results[0].source.provenance.sourceTitle, 'Upstream Historical Title');
		assert.equal(exact.results[0].source.provenance.license, 'test-license');
		assert.ok(exact.results.some(result => result.headword === 'בראשיתיות'));
		const filtered = await dictionarySearch({}, {
			query: 'בראשית',
			sourceId: 'yiddish-wiktionary',
			limit: 3
		});
		assert.equal(filtered.results[0].source.title, 'Yiddish Dictionary');
		assert.equal(filtered.results[0].senses[0].definition, 'Yiddish fixture');
		const invalid = await dictionarySearch({}, { query: 'בראשית', sourceId: '../../etc', limit: 3 });
		assert.deepEqual(invalid.results, []);
		const sources = await dictionarySources({});
		assert.deepEqual(sources.sources.map(source => source.title), [
			'Biblical Hebrew Dictionary',
			'Yiddish Dictionary'
		]);
	});
});

test('missing binary generation remains truthfully unavailable', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-lexicon-missing-'));
	const previous = process.env.AWTSMOOS_LEXICON_ROOT;
	try {
		process.env.AWTSMOOS_LEXICON_ROOT = root;
		const { dictionarySearch } = require('../search.js');
		const result = await dictionarySearch({}, { query: 'בראשית' });
		assert.equal(result.available, false);
		assert.deepEqual(result.results, []);
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_LEXICON_ROOT;
		else process.env.AWTSMOOS_LEXICON_ROOT = previous;
		await fs.rm(root, { recursive: true, force: true });
	}
});
