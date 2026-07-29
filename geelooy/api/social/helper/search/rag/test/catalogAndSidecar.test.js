// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogAndSidecar.test.js
 * @description
 * Proves four independent corpora without opening text-only marker databases.
 * The Awtsmoos names every lane truthfully; Awtsmoos.com skips only when no
 * installed local corpus exists, while unit boundaries remain continuously tested.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { availableShards, resolveShard } = require('../shards.js');
const { textSearchShard } = require('../textSearch.js');
const { parseRow, stripVectors } = require('../sidecarSearch.js');

const COLD_CATALOG_LIMIT_MS = 2000;
const COLD_STREAM_LIMIT_MS = 30000;
const EXPECTED = Object.freeze({
	'likkutei-sichos': 221043,
	'sichos-kodesh': 68490,
	'sefer-hasichos': 15022,
	'meluket': 6139
});

const databaseRoot = configuredRoot();

test('publishes four complete independent RAG lanes', {
	skip: databaseRoot ? false : 'No installed local corpus was found.'
}, async () => {
	const $i = { db: { directory: databaseRoot } };
	const listStart = performance.now();
	const shards = await availableShards({ $i });
	const listMs = performance.now() - listStart;
	assert.equal(shards.length, 4);
	assert.deepEqual(new Set(shards.map(shard => shard.id)), new Set(Object.keys(EXPECTED)));
	assert(listMs < COLD_CATALOG_LIMIT_MS, `Cold catalog took ${listMs.toFixed(1)}ms.`);
	for (const [id, count] of Object.entries(EXPECTED)) {
		const shard = shards.find(candidate => candidate.id === id);
		assert.equal(shard.count, count, `Unexpected count for ${id}.`);
		assert.equal(shard.partial, false, `${id} must be complete.`);
		assert.equal(shard.publicationStatus, 'complete');
		assert(!shard.aliases.some(alias => /part-\d+$/.test(alias)));
	}
	const likkutei = await resolveShard({ $i, lane: 'likkutei-sichos' });
	const kodesh = await resolveShard({ $i, lane: 'sichos-kodesh' });
	assert.equal(likkutei.parts.length, 28);
	assert.equal(kodesh.parts.length, 12);
	assert.equal(likkutei.textOnly, true);
	assert.equal(kodesh.textOnly, true);
	const searchStart = performance.now();
	const result = await textSearchShard(likkutei, 'Torah', 5);
	const searchMs = performance.now() - searchStart;
	assert(result.hits.length);
	assert(searchMs < COLD_STREAM_LIMIT_MS, `Cold search took ${searchMs.toFixed(1)}ms.`);
	assert.equal(result.partsSearched, 28);
	for (const hit of result.hits) {
		assert(String(hit.row.displayText || hit.row.text || '').trim());
		assert.equal(hit.row.vec, undefined);
	}
});

test('strips vector payloads from sidecar rows', () => {
	assert.deepEqual(
		parseRow(stripVectors('{"text":"source","vec":[1,2,3]}')),
		{ text: 'source' }
	);
});

function configuredRoot() {
	const configFile = path.resolve('ayzarim/awtsmoos.config.json');
	const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	const candidates = [
		process.env.AWTS_DB_ROOT,
		path.join(os.homedir(), 'Documents', 'awtsmoos', 'dayuhChadash'),
		path.resolve(config.dbPath)
	].filter(Boolean);
	return candidates.find(candidate => fs.existsSync(candidate)) || null;
}
