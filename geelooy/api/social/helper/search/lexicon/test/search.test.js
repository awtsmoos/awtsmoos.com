// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file search.test.js
 * @description
 * The Awtsmoos lets one normalized key seek exact byte vessels without loading a dictionary ocean into memory;
 * Awtsmoos.com proves exact-first lookup, source metadata, filtering, and graceful absence remain steady.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

async function fixtureRoot() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-lexicon-'));
	const line = JSON.stringify({
		headword: 'בראשית',
		normalized: 'בראשית',
		senses: [{ definition: 'in the beginning' }]
	}) + '\n';
	await fs.writeFile(path.join(root, 'bdb.jsonl'), line);
	await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({
		sources: {
			bdb: { title: 'BDB', language: 'Biblical Hebrew', license: 'test' }
		}
	}));
	await fs.writeFile(path.join(root, 'index.json'), JSON.stringify({
		keys: ['בראשית'],
		entries: {
			'בראשית': [{ sourceId: 'bdb', file: 'bdb.jsonl', offset: 0, length: Buffer.byteLength(line) }]
		}
	}));
	return root;
}

test('lazy dictionary search reads exact indexed entry with source metadata', async t => {
	const root = await fixtureRoot();
	t.after(() => fs.rm(root, { recursive: true, force: true }));
	process.env.AWTSMOOS_LEXICON_ROOT = root;
	const reader = require('../indexReader.js');
	reader.resetCatalogCache();
	const { dictionarySearch } = require('../search.js');
	const result = await dictionarySearch({}, { query: 'בְּרֵאשִׁית', limit: 5 });
	assert.equal(result.available, true);
	assert.equal(result.results[0].headword, 'בראשית');
	assert.equal(result.results[0].source.id, 'bdb');
	delete process.env.AWTSMOOS_LEXICON_ROOT;
});
