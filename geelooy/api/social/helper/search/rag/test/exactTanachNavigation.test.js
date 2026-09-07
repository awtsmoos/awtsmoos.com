// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactTanachNavigation.test.js
 * @description
 * The Awtsmoos lets בראשית ברא resolve to its actual first verse before semantic echoes from distant libraries;
 * Awtsmoos.com proves this from the persisted Tanach index and preserves the broader results behind the canonical gate.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	eligibleExactQuery,
	exactTanachHits
} = require('../exactTanachNavigation.js');
const { promoteNavigationHits } = require('../navigationPromotion.js');

test('multi-word Hebrew exact query resolves Genesis 1:1 from the persisted index', () => {
	const hits = exactTanachHits({ query: 'בראשית ברא', limit: 3 });
	assert.equal(hits.length, 1);
	assert.equal(hits[0].source, 'canonical-tanach-exact');
	assert.equal(hits[0].row.bookId, 'bereishis');
	assert.equal(hits[0].row.chapter, 1);
	assert.equal(hits[0].row.verse, 1);
	assert.equal(hits[0].row.readerUrl, '/heichelos/ikar/series/bereishis/0?idx=0');
	assert.equal(hits[0].row.canonicalNavigation, true);
});

test('single-word searches remain broad instead of hijacking library search', () => {
	assert.equal(eligibleExactQuery('בראשית'), false);
	assert.deepEqual(exactTanachHits({ query: 'בראשית' }), []);
});

test('canonical verse is first and its semantic duplicate is removed', () => {
	const [canonical] = exactTanachHits({ query: 'בראשית ברא', limit: 1 });
	const result = promoteNavigationHits({
		hits: [
			{ id: 'duplicate', row: { readerUrl: canonical.row.readerUrl } },
			{ id: 'semantic', row: { readerUrl: '/other' } }
		],
		message: 'semantic results'
	}, [canonical], 3);
	assert.equal(result.hits[0].id, canonical.id);
	assert.equal(result.hits.some(hit => hit.id === 'duplicate'), false);
	assert.equal(result.hits[1].id, 'semantic');
});
