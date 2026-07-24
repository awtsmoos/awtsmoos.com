// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogAndSidecar.test.js
 * @description
 * Proves three logical corpora are public without opening vector databases: two
 * complete lanes and one truthful eight-of-twelve multipart text lane.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { availableShards, resolveShard } = require('../shards.js');
const { textSearchShard } = require('../textSearch.js');
const { parseRow, stripVectors } = require('../sidecarSearch.js');

const COLD_CATALOG_LIMIT_MS = 2000;
const COLD_STREAM_LIMIT_MS = 30_000;

function configuredRoot() {
	const configFile = path.resolve(process.cwd(), 'ayzarim/awtsmoos.config.json');
	const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	const candidates = [
		process.env.AWTS_DB_ROOT,
		path.resolve(process.cwd(), config.dbPath),
		path.join(require('node:os').homedir(), 'Documents', 'awtsmoos', 'dayuhChadash')
	].filter(Boolean);
	const existing = candidates.find(candidate => fs.existsSync(candidate));
	assert(existing, 'No existing social database root was found.');
	return existing;
}

async function main() {
	const $i = { db: { directory: configuredRoot() } };
	const listStart = performance.now();
	const shards = await availableShards({ $i });
	const listMs = performance.now() - listStart;
	assert.equal(shards.length, 3, 'Three logical RAG lanes must be public.');
	assert.deepEqual(
		new Set(shards.map(shard => shard.id)),
		new Set(['likkutei-sichos', 'sefer-hasichos', 'sichos-kodesh'])
	);
	assert(listMs < COLD_CATALOG_LIMIT_MS, `Cold shard catalog took ${listMs.toFixed(1)}ms.`);
	const kodesh = shards.find(shard => shard.id === 'sichos-kodesh');
	assert.equal(kodesh.count, 48000);
	assert.equal(kodesh.parts.length, 8);
	assert.equal(kodesh.completeParts, 8);
	assert.equal(kodesh.expectedParts, 12);
	assert.equal(kodesh.textOnly, true);
	const selected = await resolveShard({ $i, lane: 'sichos-kodesh' });
	assert.equal(selected.parts.length, 8);
	const searchStart = performance.now();
	const result = await textSearchShard(selected, 'Torah', 5);
	const searchMs = performance.now() - searchStart;
	assert(result.hits.length, 'Multipart streaming search returned no source text.');
	assert(searchMs < COLD_STREAM_LIMIT_MS, `Cold streaming fallback took ${searchMs.toFixed(1)}ms.`);
	assert.equal(result.partsSearched, 8);
	for (const hit of result.hits) {
		assert(String(hit.row.displayText || '').trim());
		assert.equal(hit.row.vec, undefined);
	}
	const stripped = stripVectors('{"text":"source","vec":[1,2,3]}');
	assert.deepEqual(parseRow(stripped), { text: 'source' });
	console.log(JSON.stringify({
		BH: 'B"H',
		listMs: Number(listMs.toFixed(2)),
		searchMs: Number(searchMs.toFixed(2)),
		shards: shards.map(shard => ({
			id: shard.id,
			count: shard.count,
			partial: shard.partial === true
		}))
	}, null, 2));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
