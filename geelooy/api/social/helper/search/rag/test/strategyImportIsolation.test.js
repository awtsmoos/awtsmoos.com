// B"H

/**
 * @file strategyImportIsolation.test.js
 * @description
 * Proves the lightweight text-search strategy does not awaken Llama or HNSW
 * modules merely because the strategy dispatcher is imported.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const strategyPath = require.resolve('../strategy.js');
const llamaPath = require.resolve('../llama.js');
const vectorSearchPath = require.resolve('../sourceSearch.js');

function clearSearchModules() {
	delete require.cache[strategyPath];
	delete require.cache[llamaPath];
	delete require.cache[vectorSearchPath];
}

test('strategy import leaves model and vector modules sealed', () => {
	clearSearchModules();
	const strategy = require(strategyPath);

	assert.equal(typeof strategy.findSource, 'function');
	assert.equal(require.cache[llamaPath], undefined);
	assert.equal(require.cache[vectorSearchPath], undefined);
});
