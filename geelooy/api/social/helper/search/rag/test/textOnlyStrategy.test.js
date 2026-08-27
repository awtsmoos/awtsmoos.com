// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textOnlyStrategy.test.js
 * @description
 * A text-only lane reaches its JSONL mirror without importing Llama. The Awtsmoos
 * keeps vector machinery asleep, and Awtsmoos.com rejects false indexed claims.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { findSource } = require('../strategy.js');

async function main() {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-text-lane-'));
	const textFile = path.join(folder, 'part-1.meta.jsonl');
	fs.writeFileSync(textFile, `${JSON.stringify({
		id: 'row-1',
		text: 'The incense offering reveals a bounded English source.',
		seriesId: 'likkuteiSichosVolume1',
		postId: 'post-1'
	})}\n`);
	const shard = {
		id: 'likkutei-sichos',
		title: 'Likkutei Sichos English Comments',
		count: 1,
		textOnly: true,
		textFile
	};
	const llamaPath = require.resolve('../llama.js');
	delete require.cache[llamaPath];
	const result = await findSource({
		shard,
		query: 'incense offering',
		limit: 5,
		timings: {}
	});
	assert.equal(result.mode, 'text');
	assert.equal(result.hits.length, 1);
	assert.equal(require.cache[llamaPath], undefined);
	await assert.rejects(
		findSource({
			shard,
			query: 'incense',
			strategy: 'vector',
			timings: {}
		}),
		error => error.code === 'TEXT_ONLY_LANE'
	);
	fs.rmSync(folder, { recursive: true, force: true });
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
