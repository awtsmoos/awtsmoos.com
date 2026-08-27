// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shardManifestIdentity.test.js
 * @chapter Canonical Publication Names Must Preserve Every Historical Filename Door
 * @description
 * Proves manifest IDs remain canonical while the database filename slug and declared
 * aliases continue resolving after an indexed candidate replaces an older live file.
 */

const assert = require('node:assert/strict');
const {
	aliases,
	isPublishable,
	slug
} = require('../shardManifest.js');

const fileSlug = slug('/tmp/sefer-hasichos-english-comments-rag.awtsdb');
assert.equal(fileSlug, 'sefer-hasichos-english-comments-rag');

const names = aliases(
	'sefer-hasichos',
	fileSlug,
	['sefer-5748', 'Sefer-Hasichos']
);
assert(names.includes('sefer-hasichos'));
assert(names.includes('sefer-hasichos-english-comments-rag'));
assert(names.includes('dvar-hasichos'));
assert(names.includes('dr-hasichos'));
assert(names.includes('sefer-5748'));
assert.equal(new Set(names).size, names.length);

assert.equal(isPublishable({
	listName: 'vectors',
	records: 15022,
	dimensions: 384,
	disabled: false
}), true);
assert.equal(isPublishable({
	listName: 'vectors',
	records: 0,
	dimensions: 384
}), false);
assert.equal(isPublishable({
	listName: 'vectors',
	records: 15022,
	dimensions: 384,
	disabled: true
}), false);

console.log('shardManifestIdentity.test passed');
