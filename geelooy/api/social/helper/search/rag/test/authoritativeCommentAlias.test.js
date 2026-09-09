// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file authoritativeCommentAlias.test.js
 * @description
 * The Awtsmoos proves one known Torah post asks its exact native comment path
 * for aliases. No JSONL mirror, corpus map, or directory ocean participates.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
	authoritativeAliases,
	normalizeNames
} = require('../authoritativeCommentRows.js');

/** Provides the minimum native database testimony needed by exact alias lookup. */
function contextWithKeys(keys) {
	const reads = [];
	return {
		context: {
			heichelId: 'ikar',
			seriesId: 'bereishis',
			postId: 'chapter-one',
			$i: { db: { getObjectKeys: async value => (reads.push(value), keys) } }
		},
		reads
	};
}

test('native alias lookup normalizes exact-path keys without duplicates', async () => {
	const { context, reads } = contextWithKeys([
		'rashi.awtsmoosJSON',
		'rashi.awtsmoosJSON',
		'tosafos'
	]);
	assert.deepEqual(await authoritativeAliases(context), ['rashi', 'tosafos']);
	assert.equal(reads.length, 1);
	assert.match(reads[0], /heichelos\/ikar\/comments\/atSeries\/bereishis\/atPost\/chapter-one$/);
});

test('serving alias authority contains no JSONL or global metadata index', () => {
	const source = fs.readFileSync(
		path.resolve(__dirname, '../authoritativeCommentRows.js'),
		'utf8'
	);
	assert.doesNotMatch(source, /jsonl|readline|createReadStream|new Map\(/i);
	assert.match(source, /getObjectKeys/);
	assert.deepEqual(normalizeNames({
		'alpha.awtsmoosJSON': true,
		beta: true
	}), ['alpha', 'beta']);
});
