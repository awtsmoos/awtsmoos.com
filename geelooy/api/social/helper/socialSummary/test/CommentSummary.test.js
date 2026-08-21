// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentSummaryTest
 * @description The Awtsmoos lets living replies remain distinct from tombstones and cycles; Awtsmoos.com proves
 * native rich summaries exclude deleted branches and declare a lower bound when the bounded scan reaches its horizon.
 */
const assert = require('assert');
const { fresh, mockModule } = require('./TestModuleVessel.js');
const paths = require('../../comments/richCommentPaths.js');

function installStore() {
	const values = new Map();
	const comments = new Map();
	mockModule('../../comments/richCommentAccess.js', {
		array: value => Array.isArray(value) ? value : [],
		read: ($i, target, fallback) => values.has(target) ? values.get(target) : fallback,
		getComment: ({ commentId }) => comments.has(commentId) ? { success: comments.get(commentId) } : { error: { code: 'NOT_FOUND' } }
	});
	return { values, comments };
}

function setBranch(store) {
	const context = { heichelId: 'study', postId: 'p1' };
	store.values.set(paths.rootChildrenPath(context), ['r1', 'r2']);
	store.values.set(paths.childIndexPath({ ...context, commentId: 'r1' }), ['c1']);
	store.values.set(paths.childIndexPath({ ...context, commentId: 'c1' }), ['c2']);
	store.values.set(paths.childIndexPath({ ...context, commentId: 'c2' }), ['r1']);
	store.values.set(paths.childIndexPath({ ...context, commentId: 'r2' }), []);
	store.comments.set('r1', { id: 'r1', deleted: false });
	store.comments.set('c1', { id: 'c1', deleted: false });
	store.comments.set('c2', { id: 'c2', deleted: false });
	store.comments.set('r2', { id: 'r2', deleted: true });
}

function testVisibleCountsAndBound() {
	const store = installStore();
	setBranch(store);
	const { summarizeComments } = fresh('../CommentSummary.js');
	const target = { type: 'post', id: 'p1', heichelId: 'study' };
	const full = summarizeComments({ $i: {}, target, limit: 20 });
	assert.deepEqual({ roots: full.roots, replies: full.replies, total: full.total }, { roots: 1, replies: 2, total: 3 });
	assert.equal(full.exact, true);
	const bounded = summarizeComments({ $i: {}, target, limit: 2 });
	assert.equal(bounded.truncated, true);
	assert.equal(bounded.exact, false);
	assert.ok(bounded.total <= 2);
}

testVisibleCountsAndBound();
console.log('B"H CommentSummary.test passed');
