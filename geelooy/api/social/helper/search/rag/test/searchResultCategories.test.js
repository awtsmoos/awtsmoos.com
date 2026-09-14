//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchResultCategories.test.js
 * @description
 * Search presentation may switch between one global order and Torah-facing
 * category groups without rerunning corpus work. Category-local ranking remains
 * true relevance order even when global search intentionally interleaves sources.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	categoryId,
	withSearchCategories
} = require('../searchResultCategories.js');

/** Creates one public hit with a stable lane and relevance score. */
function laneHit(id, lane, score) {
	return {
		id,
		score,
		row: {
			libraryLaneId: lane
		}
	};
}

test('stable categories come from result identity rather than display titles', () => {
	assert.equal(categoryId({ source: 'canonical-tanach-exact' }), 'tanach');
	assert.equal(categoryId({ source: 'canonical-work-title' }), 'works');
	assert.equal(categoryId(laneHit('a', 'likkutei-sichos', 1)), 'sichos');
	assert.equal(categoryId(laneHit('b', 'meluket', 1)), 'chassidus');
	assert.equal(categoryId(laneHit('c', 'tanach-hebrew-verses', 1)), 'tanach');
});

test('category rank follows relevance while global order remains unchanged', () => {
	const original = [
		laneHit('lower-sicha', 'likkutei-sichos', 0.42),
		laneHit('tanach', 'tanach-hebrew-verses', 0.71),
		laneHit('higher-sicha', 'sichos-kodesh', 0.92)
	];
	const result = withSearchCategories({ hits: original });
	assert.deepEqual(result.hits.map(hit => hit.id), original.map(hit => hit.id));
	assert.equal(result.hits[0].category.id, 'sichos');
	assert.equal(result.hits[0].category.rank, 2);
	assert.equal(result.hits[2].category.rank, 1);
	assert.equal(result.hits[1].category.id, 'tanach');
	assert.equal(result.hits[1].category.rank, 1);
});

test('presentation advertises both modes with deterministic category counts', () => {
	const result = withSearchCategories({
		hits: [
			laneHit('one', 'likkutei-sichos', 0.8),
			laneHit('two', 'sichos-kodesh', 0.7),
			laneHit('three', 'meluket', 0.6)
		]
	});
	assert.deepEqual(result.presentation.modes, ['relevance', 'category']);
	assert.equal(result.presentation.defaultMode, 'relevance');
	assert.deepEqual(
		result.presentation.categories.map(category => [category.id, category.count]),
		[['chassidus', 1], ['sichos', 2]]
	);
});
