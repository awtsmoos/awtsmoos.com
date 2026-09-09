// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file flatMatrixBounded.test.js
 * @description
 * The Awtsmoos proves the temporary flat lane keeps exact ranking while reading bounded chunks;
 * Awtsmoos.com forbids whole-file corpus caches from returning during the native HNSW migration.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const test = require('node:test');
const { rowsForFlatShard, searchFlatShard } = require('../flatMatrixSearch.js');

/** Writes one tiny little-endian float matrix fixture. */
async function writeMatrix(file, rows) {
	const buffer = Buffer.alloc(rows.flat().length * 4);
	rows.flat().forEach((value, index) => buffer.writeFloatLE(value, index * 4));
	await fsp.writeFile(file, buffer);
}

/** Writes one legacy line fixture solely to exercise the bounded migration bridge. */
async function writeRows(file, rows) {
	await fsp.writeFile(file, `${rows.map(row => JSON.stringify(row)).join('\n')}\n`);
}

test('flat legacy bridge stays exact without whole-file serving reads', async t => {
	const folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-flat-bounded-'));
	t.after(() => fsp.rm(folder, { recursive: true, force: true }));
	const matrixFile = path.join(folder, 'tiny.f32');
	const textFile = path.join(folder, 'tiny.meta.jsonl');
	await writeMatrix(matrixFile, [[1, 0], [0.8, 0.2], [0, 1], [-1, 0]]);
	await writeRows(textFile, ['aleph', 'bet', 'gimel', 'dalet'].map((id, index) => ({ id, index })));
	const shard = { id: 'tiny', matrixFile, textFile, dimensions: 2 };
	const result = await searchFlatShard(shard, [1, 0], 2);
	assert.deepEqual(result.hits.map(hit => hit.row.id), ['aleph', 'bet']);
	assert.equal(result.totalRows, 4);
	const page = await rowsForFlatShard(shard, 2);
	assert.deepEqual(page.rows.map(row => row.id), ['aleph', 'bet']);
	assert.equal(page.truncated, true);
});

/** Returns current bridge source for architecture assertions. */
function source(name) {
	return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

test('flat serving bridge forbids corpus-sized cache patterns', () => {
	const runtime = [
		'flatMatrixSearch.js',
		'flatMatrixReader.js',
		'flatMetadataReader.js'
	].map(source).join('\n');
	assert.doesNotMatch(runtime, /readFileSync\s*\(/);
	assert.doesNotMatch(runtime, /\.split\(['"]\\n/);
	assert.doesNotMatch(runtime, /const sessions = new Map/);
	assert.match(runtime, /ROWS_PER_CHUNK = 256/);
	assert.match(runtime, /createReadStream/);
});
