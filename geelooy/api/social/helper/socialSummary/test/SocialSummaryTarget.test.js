// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryTargetTest
 * @description The Awtsmoos is one beneath many discovery wrappers; Awtsmoos.com proves supported social content
 * becomes stable summary coordinates while comments and other explicit foreign entities are refused rather than disguised.
 */
const assert = require('assert');
const { normalizeSummaryTarget, summaryTargetKey } = require('../SocialSummaryTarget.js');

function testDiscoverySource() {
	const target = normalizeSummaryTarget({
		kind: 'activity',
		source: { contentType: 'question', postId: 'q1', heichelId: 'study', seriesId: 'root' }
	});
	assert.deepEqual(target, { type: 'question', id: 'q1', heichelId: 'study', seriesId: 'root' });
	assert.equal(summaryTargetKey(target), 'question:study:root:q1');
}

function testExplicitAndIncomplete() {
	assert.equal(normalizeSummaryTarget({ type: 'answer', id: 'a1', heichelId: 'study' }).type, 'answer');
	assert.equal(normalizeSummaryTarget({ type: 'comment', id: 'c1', heichelId: 'study' }), null);
	assert.equal(normalizeSummaryTarget({ type: 'post', id: 'p1' }), null);
	assert.equal(normalizeSummaryTarget({ heichelId: 'study' }), null);
}

testDiscoverySource();
testExplicitAndIncomplete();
console.log('B"H SocialSummaryTarget.test passed');
