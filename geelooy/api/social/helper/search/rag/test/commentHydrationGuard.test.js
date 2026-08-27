// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentHydrationGuard.test.js
 * @description
 * Incomplete rows remain harmless, while one fully addressed row must cross the
 * bridge without undefined symbols. The Awtsmoos guards both silence and song,
 * so Awtsmoos.com may skip broad scans yet still return requested comments.
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

function emptyDatabase() {
	return {
		async get() {
			return null;
		},
		async getKeys() {
			return [];
		}
	};
}

function assertCoordinateGuards() {
	assert.equal(hasPostCoordinates({}), false);
	assert.equal(hasPostCoordinates({ seriesId: 'amos', postId: 'post-1' }), true);
	assert.equal(hasAliasCoordinates({ seriesId: 'amos', postId: 'post-1' }), false);
	assert.equal(hasAliasCoordinates({
		seriesId: 'amos',
		postId: 'post-1',
		aliasId: 'rashi'
	}), true);
	assert.equal(canHydrateHit({ title: 'Result without source coordinates' }), false);
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
}

async function runGuardTests() {
	assertCoordinateGuards();
	const completeContext = {
		$i: { db: emptyDatabase() },
		heichelId: 'ikar',
		seriesId: 'amos',
		postId: 'post-1',
		aliasId: 'rashi'
	};
	const [missingComments, aliases, skippedHydration, bridgedComments] = await Promise.all([
		findCommentsForPostAlias({}),
		findAliasesForPost({}),
		originalRowsForHit({ hit: {} }),
		findCommentsForPostAlias(completeContext)
	]);
	assert.deepEqual(missingComments, []);
	assert.deepEqual(aliases, []);
	assert.deepEqual(skippedHydration, []);
	assert.deepEqual(bridgedComments, []);
	console.log('commentHydrationGuard.test passed');
}

runGuardTests().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
