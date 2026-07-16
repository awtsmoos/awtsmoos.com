// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchContracts.test.js
 * @description
 * Pure contracts prove readable public rows, bounded request values, stable route
 * spellings, and immutable strict-RAG overrides that callers cannot downgrade.
 */

process.env.AWTS_RAG_STARTUP_WARMUP = '0';

const assert = require('node:assert/strict');
const { cleanRow, unavailableIndex } = require('../sourceSearch.js');
const { publicShard, publicHit } = require('../resultShape.js');
const { normalize, relevance, tokens } = require('../textSearch.js');
const {
	libraryOptions,
	strictRagOptions
} = require('../../routes/values.js');
const createRoutes = require('../../../../_awtsmoos.search.js');

const row = cleanRow({
	id: 'row-1',
	text: 'The Kohen Gadol wore eight garments.',
	seriesTitle: 'Temple Service',
	vector: [1, 2, 3]
});
assert.equal(row.displayText, 'The Kohen Gadol wore eight garments.');
assert.equal(row.sourceLabel, 'Temple Service');
assert.equal(row.vector, undefined);
assert.equal(row.vectorDimensions, 3);

const hit = publicHit({ score: .75, row }, 0);
assert.equal(hit.rank, 1);
assert.equal(hit.percent, 75);
assert.equal(hit.row.displayText.includes('Kohen Gadol'), true);

const shard = publicShard({
	id: 'library',
	title: 'Living Library',
	file: '/private/path/library.awtsdb',
	count: 12
});
assert.equal(shard.file, undefined);
assert.equal(shard.title, 'Living Library');

assert.deepEqual(tokens('Kohen, kohen Gadol!'), ['kohen', 'gadol']);
assert.equal(normalize('  KOHEN—GADOL  '), 'kohen gadol');
assert(relevance(row, 'kohen gadol', ['kohen', 'gadol']) > 0);
assert.equal(relevance(row, 'unrelated phrase', ['unrelated']), 0);

const $i = {
	$_GET: {
		autoInstall: 'true',
		q: 'test',
		strategy: 'text'
	},
	$_POST: {},
	db: {},
	request: {}
};
const generic = libraryOptions($i);
assert.equal(generic.autoInstall, true);
assert.equal(generic.strategy, 'text');
assert.equal(generic.requireIndexed, false);

const strict = strictRagOptions($i);
assert.equal(strict.autoInstall, false);
assert.equal(strict.strategy, 'vector');
assert.equal(strict.requireIndexed, true);

const unavailable = unavailableIndex({
	id: 'sealed-library',
	listName: 'vectors',
	vectorEnabled: false
}, {
	configured: false,
	registryCount: 0,
	entryNodeID: -1,
	maxLevel: 0
});
assert.equal(unavailable.code, 'INDEXED_VECTOR_SEARCH_UNAVAILABLE');
assert.equal(unavailable.readiness.registryCount, 0);

const routes = createRoutes({ $i });
for (const route of [
	'/search/library/shards',
	'/search/library/query',
	'/search/rag/query',
	'/rag/search/query'
]) {
	assert.equal(typeof routes[route], 'function', `missing ${route}`);
}

console.log('searchContracts.test passed');
