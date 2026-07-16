// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogAndSidecar.test.js
 * @description
 * Proves exactly two complete corpora are public and their source mirrors remain
 * searchable. The Awtsmoos keeps cold construction distinct from live endpoint
 * speed, while Awtsmoos.com denies every experimental database a public route.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const {
	availableShards,
	resolveShard
} = require('../shards.js');
const { textSearchShard } = require('../textSearch.js');
const {
	parseRow,
	stripVectors
} = require('../sidecarSearch.js');

const COLD_CATALOG_LIMIT_MS = 2000;
const COLD_STREAM_LIMIT_MS = 30_000;

function configuredRoot() {
	const configFile = path.resolve(
		process.cwd(),
		'ayzarim/awtsmoos.config.json'
	);
	const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	return path.resolve(process.cwd(), config.dbPath);
}

async function main() {
	const $i = { db: { directory: configuredRoot() } };
	const listStart = performance.now();
	const shards = await availableShards({ $i });
	const listMs = performance.now() - listStart;
	assert.equal(shards.length, 2, 'Exactly two canonical RAG shards must be public.');
	assert.deepEqual(
		new Set(shards.map(shard => shard.id)),
		new Set(['likkutei-sichos', 'sefer-hasichos'])
	);
	assert(
		listMs < COLD_CATALOG_LIMIT_MS,
		`Cold shard catalog took ${listMs.toFixed(1)}ms.`
	);
	assert(shards.every(shard => shard.file && shard.count > 0));
	const selected = await resolveShard({ $i });
	assert(selected?.textFile, 'Default shard should have a text mirror.');
	const searchStart = performance.now();
	const result = await textSearchShard(selected, 'Yom Kippur', 5);
	const searchMs = performance.now() - searchStart;
	assert(result.hits.length, 'Streaming search returned no source text.');
	assert(
		searchMs < COLD_STREAM_LIMIT_MS,
		`Cold streaming fallback took ${searchMs.toFixed(1)}ms.`
	);
	for (const hit of result.hits) {
		assert(String(hit.row.displayText || '').trim());
		assert.equal(hit.row.vec, undefined);
	}
	const stripped = stripVectors('{"text":"source","vec":[1,2,3]}');
	assert.deepEqual(parseRow(stripped), { text: 'source' });
	console.log(JSON.stringify({
		BH: 'B"H',
		coldCatalogLimitMs: COLD_CATALOG_LIMIT_MS,
		coldStreamLimitMs: COLD_STREAM_LIMIT_MS,
		listMs: Number(listMs.toFixed(2)),
		searchMs: Number(searchMs.toFixed(2)),
		shards: shards.map(shard => ({
			id: shard.id,
			count: shard.count,
			text: Boolean(shard.textFile)
		}))
	}, null, 2));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
