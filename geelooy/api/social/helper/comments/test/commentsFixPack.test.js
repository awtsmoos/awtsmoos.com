// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Comments fix pack regression.
 * @description Proves the corrected comment write/read contract end to end
 * against the real packed store: section-carried bodies are promoted into
 * the flat body, comment counts are maintained by create/delete, the
 * canonical comment route answers PUT with ownership enforced, and the
 * legacy delete doorways refuse anonymous callers.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const access = require('../richCommentAccess.js');
const packed = require('../richDb/PackedStore.js');
const counts = require('../richCommentCount.js');
const mutation = require('../richCommentMutation.js');
const tree = require('../richCommentReaderTree.js');
const richRoutes = require('../routes/rich.js');
const legacyCommentRoutes = require('../routes/comment.js');
const postRoutes = require('../routes/post.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-comments-fix-'));
const synced = [];
const heichelId = 'ikar';
const postId = 'fix-post';
const postId2 = 'fix-post-2';

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
			if (target === '/users/user-1/aliases/bob') return { aliasId: 'bob' };
			if (target === '/users/user-2/aliases/bob') return { aliasId: 'bob' };
			if (target === `/social/heichelos/${heichelId}/posts/${postId}`) return { id: postId, author: 'alice', aliasId: 'alice' };
			if (target === `/social/heichelos/${heichelId}/posts/${postId2}`) return { id: postId2, author: 'bob', aliasId: 'bob' };
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

function post(fields) {
	$i.$_POST = fields;
	$i.$_GET = {};
}

async function createRootSectionsOnly() {
	post({
		aliasId: 'alice',
		content: '',
		sections: JSON.stringify([{ title: '', content: 'Words that only lived in sections' }]),
		verseSection: 'root'
	});
	const created = await mutation.createComment({
		$i, userid: 'user-1', heichelId, seriesId: 'series-1', postId, aliasId: 'alice'
	});
	assert.ok(created.success, `sections-only create failed: ${JSON.stringify(created)}`);
	const stored = access.getComment({ $i, heichelId, postId, commentId: created.success.id });
	assert.equal(stored.success.content, 'Words that only lived in sections');
	assert.equal(stored.success.sections.length, 1);
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 1);
	assert.ok(synced.some(([, key, value]) => key === 'commentCount' && value === 1));
	return created.success;
}

async function createReply(parentId) {
	post({
		aliasId: 'alice',
		content: 'A plain reply body',
		verseSection: 'root'
	});
	// The route/compat layer translates a client's replyToId into this
	// explicit parentId parameter of the internal create contract.
	const created = await mutation.createComment({
		$i, userid: 'user-1', heichelId, seriesId: 'series-1', postId, aliasId: 'alice', parentId
	});
	assert.ok(created.success, `reply create failed: ${JSON.stringify(created)}`);
	assert.equal(created.success.parentId, parentId);
	assert.equal(created.success.content, 'A plain reply body');
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 2);
	const report = await tree.getTree({ $i, heichelId, postId });
	assert.equal(report.meta.commentCount, 2);
	return created.success;
}

async function provePutOwnership(rootComment) {
	const route = '/heichelos/:heichel/posts/:post/comments/:comment';
	const vars = { heichel: heichelId, post: postId, comment: rootComment.id };
	$i.request.method = 'PUT';

	$i.$_PUT = { aliasId: 'alice', content: 'Edited by the author' };
	const asAuthor = await richRoutes({ $i, userid: 'user-1' })[route](vars);
	assert.equal(asAuthor.success?.content, 'Edited by the author', `author PUT failed: ${JSON.stringify(asAuthor)}`);

	$i.$_PUT = { aliasId: 'alice', content: 'Stolen edit' };
	const asStranger = await richRoutes({ $i, userid: 'user-2' })[route](vars);
	assert.equal(asStranger.error?.code, 'NOT_AUTHORIZED', `stranger PUT not refused: ${JSON.stringify(asStranger)}`);

	$i.$_PUT = { aliasId: 'bob', content: 'Wrong alias edit' };
	const asOtherAlias = await richRoutes({ $i, userid: 'user-1' })[route](vars);
	assert.equal(asOtherAlias.error?.code, 'NOT_AUTHORIZED', `other-alias PUT not refused: ${JSON.stringify(asOtherAlias)}`);

	const stored = access.getComment({ $i, heichelId, postId, commentId: rootComment.id });
	assert.equal(stored.success.content, 'Edited by the author');
}

async function proveLegacyDeleteGate(rootComment, reply) {
	const route = '/heichelos/:heichel/comment/:comment';
	$i.request.method = 'DELETE';
	// The legacy doorway's own client passes the post coordinate in the body.
	$i.$_DELETE = { postId };

	const anonymous = await legacyCommentRoutes({ $i, userid: null })[route]({ heichel: heichelId, comment: reply.id });
	assert.equal(anonymous.error?.code, 'NOT_AUTHORIZED', `anonymous legacy DELETE not refused: ${JSON.stringify(anonymous)}`);

	const asAuthor = await legacyCommentRoutes({ $i, userid: 'user-1' })[route]({ heichel: heichelId, comment: reply.id });
	assert.ok(asAuthor.success, `author legacy DELETE failed: ${JSON.stringify(asAuthor)}`);
	assert.equal(counts.storedCount({ $i, heichelId, postId }), 1);
	void rootComment;
}

async function proveBulkGates() {
	post({ aliasId: 'alice', content: 'Bulk target comment', verseSection: 'root' });
	const created = await mutation.createComment({
		$i, userid: 'user-1', heichelId, seriesId: 'series-1', postId: postId2, aliasId: 'alice'
	});
	assert.ok(created.success, `bulk seed create failed: ${JSON.stringify(created)}`);
	$i.request.method = 'DELETE';
	$i.$_DELETE = {};

	const allRoute = '/heichelos/:heichel/post/:post/comments/';
	const aliasRoute = '/heichelos/:heichel/post/:post/comments/aliases/:alias';

	const anonAll = await postRoutes({ $i, userid: null })[allRoute]({ heichel: heichelId, post: postId2 });
	assert.equal(anonAll.error?.code, 'NOT_AUTHORIZED', `anonymous deleteAll not refused: ${JSON.stringify(anonAll)}`);

	const anonAlias = await postRoutes({ $i, userid: null })[aliasRoute]({ heichel: heichelId, post: postId2, alias: 'alice' });
	assert.equal(anonAlias.error?.code, 'NOT_AUTHORIZED', `anonymous deleteAlias not refused: ${JSON.stringify(anonAlias)}`);

	// The comments' own author may clear their alias's comments.
	const asAuthor = await postRoutes({ $i, userid: 'user-1' })[aliasRoute]({ heichel: heichelId, post: postId2, alias: 'alice' });
	assert.ok(asAuthor.success, `author deleteAlias failed: ${JSON.stringify(asAuthor)}`);
}

function proveDeleteSuffixMethodGate() {
	const source = fs.readFileSync(require.resolve('../../routes/posts/seriesRoutes.js'), 'utf8');
	const routeAt = source.indexOf("/post/:post/delete'");
	assert.ok(routeAt > -1);
	const gateAt = source.indexOf('METHOD_NOT_ALLOWED', routeAt);
	const callAt = source.indexOf('return deletePostFromSeries', routeAt);
	assert.ok(gateAt > -1 && callAt > gateAt, 'delete suffix route must refuse non-mutation methods before deleting');
}

async function run() {
	const rootComment = await createRootSectionsOnly();
	const reply = await createReply(rootComment.id);
	await provePutOwnership(rootComment);
	await proveLegacyDeleteGate(rootComment, reply);
	await proveBulkGates();
	proveDeleteSuffixMethodGate();
	console.log('commentsFixPack.test.js PASS');
}

run()
	.catch(error => { console.error(error); process.exitCode = 1; })
	.finally(() => { packed.closeAll(); fs.rmSync(root, { recursive: true, force: true }); });
