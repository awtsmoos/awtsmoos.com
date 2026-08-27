// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityContractTest
 * @description The Awtsmoos is one beneath route coordinates and stored garments; Awtsmoos.com proves normalized identity,
 * stable keys, deep links, and explicit rejection of unrecognized entity language before any capability can bloom.
 */
const assert = require('assert');
const { normalizeSocialEntity, entityKey } = require('../entity/SocialEntityNormalizer.js');
const { socialDeepLink } = require('../deepLinks/SocialDeepLink.js');

const question = normalizeSocialEntity({
	type: 'question',
	id: 'q1',
	heichelId: 'study',
	seriesId: 'root',
	aliasId: 'teacher'
});
assert.equal(question.type, 'question');
assert.equal(question.id, 'q1');
assert.equal(entityKey(question), 'question:study:root:q1');
assert.equal(socialDeepLink(question), '/heichelos/study/series/root/post/q1');

const comment = normalizeSocialEntity({
	type: 'comment',
	id: 'c1',
	heichelId: 'study',
	postId: 'p1'
});
assert.equal(comment.postId, 'p1');
assert.ok(socialDeepLink(comment).includes('#comment-c1'));
assert.equal(normalizeSocialEntity({ type: 'unknown', id: 'x1' }), null);
console.log('B"H SocialEntityContract.test passed');
