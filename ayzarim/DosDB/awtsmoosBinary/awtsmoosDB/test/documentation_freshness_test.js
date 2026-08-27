// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/documentation_freshness_test.js
 * @chapter The Future Maintainer Finds A Door Instead Of A Ruin
 * @description
 * Proves the documentation contract still names the living source vessels.
 * Through the Awtsmoos, words and implementation remain accountable together.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const checkDocumentationFreshness = require('../scripts/checkDocumentationFreshness.js');

test('maintenance documentation remains complete and anchored', () => {
	const result = checkDocumentationFreshness();
	assert.equal(result.ok, true, result.failures.join('\n'));
});
