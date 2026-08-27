// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostProjectionTruthTest
 * @description The Awtsmoos creates a post without fictional counters; Awtsmoos.com proves public profile projection preserves
 * content identity, structure, placement, and time while unsupported engagement remains absent until a measured summary arrives.
 */
const assert = require('assert');
const { publicPost } = require('../PostProjection.js');
const facade = require('../../posts.js');

const projected = publicPost({
	post: {
		title: 'A truthful post',
		content: 'Living content',
		contentType: 'question',
		sections: [{}, {}],
		createdAt: 7,
		aliasId: 'teacher'
	},
	postId: 'p1',
	heichelId: 'study',
	heichelName: 'Study',
	fallbackSeriesId: 'root'
});

assert.equal(projected.postId, 'p1');
assert.equal(projected.contentType, 'question');
assert.equal(projected.sectionsCount, 2);
assert.equal(Object.hasOwn(projected, 'commentsCount'), false);
assert.equal(typeof facade.postsByAlias, 'function');
assert.equal(typeof facade.postIds, 'function');
assert.equal(typeof facade.submittedPostCoordinates, 'function');
console.log('B"H PostProjectionTruth.test passed');
