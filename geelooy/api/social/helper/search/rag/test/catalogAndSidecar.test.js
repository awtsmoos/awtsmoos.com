// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogAndSidecar.test.js
 * @description
 * Proves installed production corpora expose three logical lanes without opening
 * vector databases. When no local corpus is installed, the integration probe skips
 * explicitly while unit tests continue to enforce publication boundaries.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { availableShards, resolveShard } = require('../shards.js');
const { textSearchShard } = require('../textSearch.js');
const { parseRow, stripVectors } = require('../sidecarSearch.js');

const COLD_CATALOG_LIMIT_MS = 2000;
const COLD_STREAM_LIMIT_MS = 30_000;

test('installed catalog exposes complete reviewed publication lanes', async t => {
	const databaseRoot = configuredRoot();
	if (!databaseRoot) {
		t.skip('No local social database root is installed.');
		return;
	}
	const $i = { db: { directory: databaseRoot } };
	const listStart = performance.now();
	const shards = await availableShards({ $i });
	const listMs = performance.now() - listStart;
	if (!shards.length) {
		t.skip('No local published RAG corpus is installed at the configured roots.');
		return;
	}
	assert.equal(shards.length, 3, 'Three logical RAG lanes must be public.');
	assert.deepEqual(
		new Set(shards.map(shard => shard.id)),
		new Set(['likkutei-sichos', 'sefer-hasichos', 'sichos-kodesh'])
	);
	assert(listMs < COLD_CATALOG_LIMIT_MS, `Cold shard catalog took ${listMs.toFixed(1)}ms.`);
	const kodesh = shards.find(shard => shard.id === 'sichos-kodesh');
	assert.equal(kodesh.parts.length, 12);
	assert.equal(kodesh.completeParts, 12);
	assert.equal(kodesh.expectedParts, 12);
	assert.equal(kodesh.partial, false);
	assert.equal(kodesh.textOnly, true);
	assert(kodesh.count > 0);
	const selected = await resolveShard({ $i, lane: 'sichos-kodesh' });
	assert.equal(selected.parts.length, 12);
	const searchStart = performance.now();
	const result = await textSearchShard(selected, 'Torah', 5);
	const searchMs = performance.now() - searchStart;
	assert(result.hits.length, 'Multipart streaming search returned no source text.');
	assert(searchMs < COLD_STREAM_LIMIT_MS, `Cold streaming fallback took ${searchMs.toFixed(1)}ms.`);
	assert.equal(result.partsSearched, 12);
	for (const hit of result.hits) {
		assert(String(hit.row.displayText || '').trim());
		assert.equal(hit.row.vec, undefined);
	}
	const stripped = stripVectors('{"text":"source","vec":[1,2,3]}');
	assert.deepEqual(parseRow(stripped), { text: 'source' });
});

function configuredRoot() {
	const configFile = path.resolve(process.cwd(), 'ayzarim/awtsmoos.config.json');
	const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	const candidates = [
		process.env.AWTS_DB_ROOT,
		path.resolve(process.cwd(), config.dbPath),
		path.join(require('node:os').homedir(), 'Documents', 'awtsmoos', 'dayuhChadash')
	].filter(Boolean);
	return candidates.find(candidate => fs.existsSync(candidate)) || null;
}
