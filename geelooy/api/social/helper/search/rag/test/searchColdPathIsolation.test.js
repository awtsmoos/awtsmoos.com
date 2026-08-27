// B"H

/**
 * @file searchColdPathIsolation.test.js
 * @description
 * Proves a plain text-search entry point does not awaken vector storage or
 * comment hydration modules before those features are explicitly requested.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const searchPath = require.resolve('../search.js');
const sourceSearchPath = require.resolve('../sourceSearch.js');
const commentsPath = require.resolve('../comments.js');
const commentRelevancePath = require.resolve('../commentRelevance.js');

function clearModules() {
	for (const modulePath of [
		searchPath,
		sourceSearchPath,
		commentsPath,
		commentRelevancePath
	]) {
		delete require.cache[modulePath];
	}
}

test('search import leaves vector and comment features sealed', () => {
	clearModules();
	const search = require(searchPath);

	assert.equal(typeof search.ragSearch, 'function');
	assert.equal(typeof search.rowsForShard, 'function');
	assert.equal(typeof search.searchShard, 'function');
	assert.equal(require.cache[sourceSearchPath], undefined);
	assert.equal(require.cache[commentsPath], undefined);
	assert.equal(require.cache[commentRelevancePath], undefined);
});
