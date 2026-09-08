//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ShardedLexiconFixture
 * @description
 * The Awtsmoos lets tests open the same catalog-and-letter vessels production reads, with no JSON database imitation between;
 * Awtsmoos.com proves real binary shard routing, exact order, source metadata, and bounded AwtsmoosDB ranges seen.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const AwtsmoosDB = require('../../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { entryKey, shardToken } = require('../keySpace.js');

async function createFixtureDatabase(root) {
	const current = path.join(root, 'current');
	await fs.mkdir(current, { recursive: true });
	await createCatalog(current);
	await createShard(current, 'bdb', [
		entry('בראשית', 'in the beginning'),
		entry('בראשיתיות', 'a prefix neighbor')
	]);
	await createShard(current, 'yiddish-wiktionary', [entry('בראשית', 'Yiddish fixture')]);
}

async function createCatalog(current) {
	const database = new AwtsmoosDB(path.join(current, 'catalog.awtsdb'), { compression: false });
	await database.open();
	database.root.sources = new database.Map();
	await database.root.sources.set('bdb', source('bdb', 'Upstream Historical Title', 'test-license'));
	await database.root.sources.set('yiddish-wiktionary', source('yiddish-wiktionary', 'Upstream Yiddish Title', 'test-yiddish-license'));
	database.root.meta = {
		format: 'awtsmoos-lexicon-sharded-v1',
		sourceOrder: ['bdb', 'yiddish-wiktionary'],
		totalEntries: 3,
		shards: { bdb: { '05d1': 2 }, 'yiddish-wiktionary': { '05d1': 1 } }
	};
	await database.waitForIdle();
	await database.close();
}

async function createShard(current, sourceId, entries) {
	const token = shardToken(entries[0].normalized);
	const folder = path.join(current, 'shards', sourceId);
	await fs.mkdir(folder, { recursive: true });
	const database = new AwtsmoosDB(path.join(folder, `${token}.awtsdb`), { compression: false });
	await database.open();
	database.root.entries = new database.Map();
	for (let index = 0; index < entries.length; index++) {
		await database.root.entries.set(entryKey(entries[index].normalized, index), entries[index]);
	}
	await database.waitForIdle();
	await database.close();
}

function entry(headword, definition) {
	return { headword, normalized: headword, senses: [{ definition }] };
}

function source(id, title, license) {
	return { id, title, language: 'fixture', license, sourceUrl: `https://example.test/${id}`, version: 'fixture-1' };
}

module.exports = { createFixtureDatabase };
