// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Counter/cascade alignment proof (edit/delete integration).
 * @description The posts pack's rich-comment cascade tombstones through
 * the comments layer's deleteOne primitive directly (not via a route).
 * The per-post comment counter's decrement lives inside that same
 * primitive (richCommentDelete.deleteOne, guarded by the comment's own
 * not-yet-deleted state), and nowhere in any route layer — so the route
 * path and the cascade path must each decrement exactly once per
 * tombstone, and a repeat delete must not decrement again. This suite
 * proves all three properties against the real packed store:
 *   1. create via the mutation (route) path + delete via the CASCADE
 *      -> the counter reaches exactly 0.
 *   2. create + delete via the canonical comment ROUTE -> exactly one
 *      decrement per comment; a repeat route delete does not move it.
 *   3. after a cascade empties a post, a fresh create counts from the
 *      cascaded total (no drift carried across the cascade).
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const access = require('../richCommentAccess.js');
const packed = require('../richDb/PackedStore.js');
const counts = require('../richCommentCount.js');
const mutation = require('../richCommentMutation.js');
const richRoutes = require('../routes/rich.js');
const { deleteAllRichCommentsForPost } = require('../richCommentCascade.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-counter-align-'));
const synced = [];
const heichelId = 'ikar';

const $i = {
	request: { method: 'GET', headers: {} },
	$_GET: {},
	$_POST: {},
	$_PUT: {},
	$_DELETE: {},
	db: {
		directory: root,
		async get(target) {
			if (target === '/users/user-1/aliases/alice') return { aliasId: 'alice' };
			throw new Error(`missing: ${target}`);
		},
		async write() {
			throw new Error('generic comment write forbidden');
		},
		async syncKeyInObj(filePath, key, value) {
			synced.push([filePath, key, value]);
			return true;
		}
	}
};

async function create(postId, content, parentId = '') {
	$i.$_POST = { aliasId: 'alice', content, verseSection: 'root' };
	const created = await mutation.createComment({
		$i, userid: 'user-1', heichelId, seriesId: 'series-1', postId, aliasId: 'alice', parentId
	});
	assert.ok(created.success, `create failed: ${JSON.stringify(created)}`);
	return created.success;
}

async function routeDelete(postId, commentId) {
	$i.request.method = 'DELETE';
	$i.$_DELETE = { aliasId: 'alice' };
	const route = '/heichelos/:heichel/posts/:post/comments/:comment';
	return richRoutes({ $i, userid: 'user-1' })[route]({ heichel: heichelId, post: postId, comment: commentId });
}

async function proveCascadePath() {
	const postId = 'align-cascade';
	const rootComment = await create(postId, 'cascade root');
	await create(postId, 'cascade reply', rootComment.id);
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 2, 'count after two creates');
	const result = await deleteAllRichCommentsForPost({ $i, heichelId, postId, reason: 'post-deleted' });
	assert.equal(result.deleted, 2, `cascade deleted count: ${JSON.stringify(result)}`);
	assert.equal(
		counts.storedCount({ $i, heichelId, postId }), 0,
		'cascade path must decrement the counter to exactly 0'
	);
	assert.ok(
		synced.some(([file, key, value]) => file.endsWith(`/posts/${postId}`) && key === 'commentCount' && value === 0),
		'post record write-through must carry commentCount 0 after cascade'
	);
	// A fresh create after the cascade counts from the cascaded total.
	await create(postId, 'after cascade');
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 1, 'create after cascade counts from 0');
	console.log('counterCascadeAlignment: cascade path PASS');
}

async function proveRoutePath() {
	const postId = 'align-route';
	const rootComment = await create(postId, 'route root');
	const reply = await create(postId, 'route reply', rootComment.id);
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 2, 'count after two creates');

	const delReply = await routeDelete(postId, reply.id);
	assert.ok(delReply.success, `route DELETE of reply failed: ${JSON.stringify(delReply)}`);
	assert.equal(
		counts.storedCount({ $i, heichelId, postId }), 1,
		'route delete must decrement exactly once (reply + its own tombstone only)'
	);

	const delRoot = await routeDelete(postId, rootComment.id);
	assert.ok(delRoot.success, `route DELETE of root failed: ${JSON.stringify(delRoot)}`);
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 0, 'route delete of root reaches 0');

	// Repeat delete of the same (already tombstoned) comment: deleteOne
	// reports 0 new deletions and the counter must NOT move again.
	const delAgain = await routeDelete(postId, rootComment.id);
	assert.ok(delAgain.success, `repeat route DELETE failed: ${JSON.stringify(delAgain)}`);
	assert.equal(delAgain.success.deleted, 0, 'repeat delete tombstones nothing new');
	assert.equal(
		counts.storedCount({ $i, heichelId, postId }), 0,
		'repeat delete must not double-decrement'
	);
	console.log('counterCascadeAlignment: route path PASS');
}

async function run() {
	await proveCascadePath();
	await proveRoutePath();
	console.log('counterCascadeAlignment.test.js PASS');
}

run()
	.catch(error => { console.error(error); process.exitCode = 1; })
	.finally(() => { packed.closeAll(); fs.rmSync(root, { recursive: true, force: true }); });
