// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file libraryCommentsDefault.test.js
 * @description
 * Default search exposes static translated metadata but keeps mutable database
 * hydration off. Explicit false suppresses all comments; true requests both.
 */

const assert = require('node:assert/strict');
const {
	libraryOptions
} = require('../../routes/values.js');

function context(get = {}) {
	return {
		$_GET: get,
		$_POST: {},
		db: {},
		request: {}
	};
}

const defaultOptions = libraryOptions(context({ q: 'Torah' }));
assert.equal(defaultOptions.includeComments, false);
assert.equal(defaultOptions.includeMetadataComments, true);
assert.equal(defaultOptions.strategy, 'text');

const disabled = libraryOptions(context({
	q: 'Torah',
	comments: 'false'
}));
assert.equal(disabled.includeComments, false);
assert.equal(disabled.includeMetadataComments, false);

const enabled = libraryOptions(context({
	q: 'Torah',
	comments: 'true',
	shard: 'meluket'
}));
assert.equal(enabled.includeComments, true);
assert.equal(enabled.includeMetadataComments, true);
assert.equal(enabled.lane, 'meluket');

console.log('libraryCommentsDefault.test passed');
