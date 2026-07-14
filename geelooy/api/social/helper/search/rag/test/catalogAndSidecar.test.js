// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogAndSidecar.test.js
 * @description
 * The live configured corpus proves manifest-only listing and streaming source text.
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
	assert(shards.length >= 3, 'Expected proven production shards.');
	assert(listMs < 1000, `Shard catalog took ${listMs.toFixed(1)}ms.`);
	assert(shards.every(shard => shard.file && shard.count >= 0));
	const selected = await resolveShard({ $i });
	assert(selected?.textFile, 'Default shard should have a text mirror.');
	const searchStart = performance.now();
	const result = await textSearchShard(selected, 'Yom Kippur', 5);
	const searchMs = performance.now() - searchStart;
	assert(result.hits.length, 'Streaming search returned no source text.');
	assert(searchMs < 15_000, `Streaming search took ${searchMs.toFixed(1)}ms.`);
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
			text: Boolean(shard.textFile)
		})),
		hits: result.hits.map(hit => ({
			title: hit.row.title,
			sourceLabel: hit.row.sourceLabel,
			displayText: hit.row.displayText.slice(0, 180)
		}))
	}, null, 2));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
