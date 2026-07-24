// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentHydrationGuard.test.js
 * @description
 * Incomplete search rows must remain harmless: no missing series, post, alias, or
 * comment identifier may awaken a broad authoritative or historical shard scan.
 */

const assert = require('node:assert/strict');
const {
	findAliasesForPost,
	findCommentsForPostAlias,
	hasAliasCoordinates,
	hasPostCoordinates
} = require('../commentSources.js');
const {
	canHydrateHit,
	commentIds,
	originalRowsForHit
} = require('../commentHitHydration.js');

assert.equal(hasPostCoordinates({}), false);
assert.equal(hasPostCoordinates({ seriesId: 'amos', postId: 'post-1' }), true);
assert.equal(hasAliasCoordinates({ seriesId: 'amos', postId: 'post-1' }), false);
assert.equal(hasAliasCoordinates({
	seriesId: 'amos',
	postId: 'post-1',
	aliasId: 'rashi'
}), true);

assert.equal(canHydrateHit({
	title: 'Sefer HaSichos result without source coordinates'
}), false);
assert.equal(canHydrateHit({
	seriesId: 'amos',
	postId: 'post-1',
	aliasId: 'rashi'
}), false);
assert.equal(canHydrateHit({
	seriesId: 'amos',
	postId: 'post-1',
	aliasId: 'rashi',
	commentIds: ['comment-1']
}), true);
assert.deepEqual(commentIds({
	commentIds: ['a', 'a', '', null, 'b']
}), ['a', 'b']);

Promise.all([
	findCommentsForPostAlias({}),
	findAliasesForPost({}),
	originalRowsForHit({ hit: {} })
]).then(([comments, aliases, hydrated]) => {
	assert.deepEqual(comments, []);
	assert.deepEqual(aliases, []);
	assert.deepEqual(hydrated, []);
	console.log('commentHydrationGuard.test passed');
}).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
