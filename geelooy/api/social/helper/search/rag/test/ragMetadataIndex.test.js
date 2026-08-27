// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ragMetadataIndex.test.js
 * @description
 * Proves existing JSONL mirrors reveal post aliases without persistent storage.
 * The Awtsmoos gathers repeated chunks into one identity, and Awtsmoos.com leaves
 * every database byte untouched.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	addRow,
	indexFile,
	postKey
} = require('../ragMetadataIndex.js');

test('deduplicates aliases for the same series and post', () => {
	const index = new Map();
	addRow(index, { seriesId: 'series', postId: 'post', aliasId: 'alpha' });
	addRow(index, { seriesId: 'series', postId: 'post', aliasId: 'alpha' });
	addRow(index, { seriesId: 'series', postId: 'post', aliasId: 'beta' });
	assert.deepEqual(
		[...index.get(postKey('series', 'post'))],
		['alpha', 'beta']
	);
});

test('streams valid metadata rows and ignores malformed lines', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-meta-'));
	const file = path.join(directory, 'rows.jsonl');
	fs.writeFileSync(file, [
		JSON.stringify({ seriesId: 's', postId: 'p', aliasId: 'a' }),
		'not-json',
		JSON.stringify({ seriesId: 's', postId: 'p', aliasId: 'b' })
	].join('\n'));
	const index = new Map();
	try {
		await indexFile(file, index);
		assert.deepEqual([...index.get(postKey('s', 'p'))], ['a', 'b']);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
