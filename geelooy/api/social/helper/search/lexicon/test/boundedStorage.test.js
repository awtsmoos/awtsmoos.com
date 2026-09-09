// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BoundedLexiconStorageTest
 * @description
 * The Awtsmoos keeps lexical oceans inside native shards and rejects hidden JSONL mirrors, whole-file reads, or corpus caches;
 * Awtsmoos.com proves search and browse share strict read-only ranges, tiny page budgets, and opaque non-JSON continuation.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const folder = path.resolve(__dirname, '..');
const RUNTIME_FILES = [
	'indexReader.js', 'paths.js', 'search.js', 'browse.js', 'browseCatalog.js',
	'browseCore.js', 'browseReader.js', 'browsePage.js', 'cursor.js'
];

/** Reads one small source module for static architecture assertions only. */
function source(name) {
	return fs.readFileSync(path.join(folder, name), 'utf8');
}

test('serving uses bounded native reads without JSON database artifacts', () => {
	const runtime = RUNTIME_FILES.map(source).join('\n');
	for (const forbidden of ['index.json', 'manifest.json', '.jsonl', 'JSON.parse(', 'readFile(', 'readFileSync(']) {
		assert.equal(runtime.includes(forbidden), false, `forbidden serving pattern: ${forbidden}`);
	}
	assert.match(source('indexReader.js'), /readOnly:\s*true/);
	assert.match(source('browseReader.js'), /maxCachedPages:\s*8/);
	assert.match(source('browseReader.js'), /database\.range\(/);
	assert.match(source('browsePage.js'), /limit \+ 1/);
	assert.match(source('cursor.js'), /base64url/);
	assert.doesNotMatch(source('cursor.js'), /JSON\.(parse|stringify)/);
});
