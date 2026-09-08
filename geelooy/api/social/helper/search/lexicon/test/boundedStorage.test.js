//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file boundedStorage.test.js
 * @description
 * The Awtsmoos keeps lexical oceans on disk and forbids hidden JSON databases or corpus-sized caches from returning;
 * Awtsmoos.com proves strict read-only shard ranges, tiny page budgets, and first-letter routing in the serving current.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const folder = path.resolve(__dirname, '..');
function source(name) {
	return fs.readFileSync(path.join(folder, name), 'utf8');
}

test('serving uses sharded bounded binary reads without JSON database artifacts', () => {
	const runtime = ['indexReader.js', 'paths.js', 'search.js'].map(source).join('\n');
	for (const forbidden of ['index.json', 'manifest.json', '.jsonl', 'JSON.parse(', 'readFile(']) {
		assert.equal(runtime.includes(forbidden), false, `forbidden serving pattern: ${forbidden}`);
	}
	assert.match(source('indexReader.js'), /readOnly:\s*true/);
	assert.match(source('indexReader.js'), /maxCachedPages:\s*8/);
	assert.match(source('indexReader.js'), /database\.range\(/);
	assert.match(source('search.js'), /shardToken\(/);
	assert.doesNotMatch(source('search.js'), /matchingKeys|lowerBound|catalogCache/);
});
