// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Legacy comment compatibility regression.
 * @description Old public GET/PUT URLs resolve through the dedicated rich store only.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const access = require('../richCommentAccess.js');
const packed = require('../richDb/PackedStore.js');
const paths = require('../richCommentPaths.js');
const postRoutes = require('../routes/post.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-rich-compat-'));
const genericPaths = [];
const $i = {
	request: { method: 'GET', headers: {} },
	$_GET: {},
	$_POST: {},
	$_PUT: {},
	$_DELETE: {},
	db: {
		directory: root,
		async get(target) {
			genericPaths.push(target);
			if (target === '/users/user-1/aliases/alice') return { aliasId: 'alice' };
			throw new Error(`generic comment storage forbidden: ${target}`);
		},
		async write() {
			throw new Error('generic comment write forbidden');
		}
	}
};
const heichelId = 'ikar';
const postId = 'compat-post';
const comment = {
	id: 'compat-1',
	heichelId,
	postId,
	seriesId: 'series-1',
	aliasId: 'alice',
	author: 'alice',
	content: 'Dedicated comment',
	verseSection: '0',
	subsectionId: '0',
	parentId: '',
	deleted: false
};

function seed() {
	const ctx = access.context(heichelId, postId, { commentId: comment.id, verseSection: '0', subsectionId: '0' });
	access.write($i, paths.commentPath(ctx), comment);
	access.write($i, paths.rootChildrenPath(ctx), [comment.id]);
	access.write($i, paths.verseIndexPath(ctx), [comment.id]);
	access.write($i, paths.subsectionIndexPath(ctx), [comment.id]);
	access.write($i, paths.childIndexPath(ctx), []);
}

async function proveReads(routes) {
	const authors = await routes['/heichelos/:heichel/series/:series/post/:post/comments/aliases']({ heichel: heichelId, series: 'series-1', post: postId });
	assert.deepStrictEqual(authors.success, ['alice']);
	const rows = await routes['/heichelos/:heichel/series/:series/post/:post/comments/aliases/:alias']({ heichel: heichelId, series: 'series-1', post: postId, alias: 'alice' });
	assert.equal(rows.success.length, 1);
	assert.equal(rows.success[0].content, 'Dedicated comment');
	assert.deepStrictEqual(genericPaths, []);
}

async function proveUpdate() {
	$i.request.method = 'PUT';
	$i.$_PUT = {
		aliasId: 'alice',
		commentId: comment.id,
		dayuh: JSON.stringify({ timesheet: { time: 5786, path: 'safe.json' }, verseSection: 0 })
	};
	const routes = postRoutes({ $i, userid: 'user-1' });
	const updated = await routes['/heichelos/:heichel/post/:post/comments/']({ heichel: heichelId, post: postId });
	assert.equal(updated.success.id, comment.id);
	assert.equal(updated.success.dayuh.timesheet.path, 'safe.json');
	assert.equal(updated.success.legacyDayuh.timesheet.time, 5786);
	assert.deepStrictEqual(genericPaths, ['/users/user-1/aliases/alice']);
	const stored = access.getComment({ $i, heichelId, postId, commentId: comment.id });
	assert.equal(stored.success.dayuh.timesheet.path, 'safe.json');
	assert.equal(stored.success.verseSection, '0');
}

async function proveSourceContracts() {
	const postSource = fs.readFileSync(require.resolve('../routes/post.js'), 'utf8');
	const mutationSource = fs.readFileSync(require.resolve('../routes/postMutationOperations.js'), 'utf8');
	const commentSource = fs.readFileSync(require.resolve('../routes/comment.js'), 'utf8');
	const panelSource = fs.readFileSync(path.join(process.cwd(), 'geelooy/heichelos/post/comments/panel/fetching.js'), 'utf8');
	const submitSource = fs.readFileSync(path.join(process.cwd(), 'geelooy/heichelos/post/commentSection/submit.js'), 'utf8');
	assert.doesNotMatch(postSource, /require\(['"]\.\.\/index\.js/);
	assert.doesNotMatch(commentSource, /require\(['"]\.\.\/index\.js/);
	assert.match(postSource, /postMutationOperations\.js/);
	assert.match(mutationSource, /updateLegacy/);
	assert.match(commentSource, /updateLegacy/);
	assert.doesNotMatch(panelSource, /comments\/aliases|rag\/post-comments/);
	assert.match(panelSource, /\.\/tree\.js/);
	assert.doesNotMatch(submitSource, /mirrorRichComment|postOldComment/);
	assert.match(submitSource, /\/comment-tree/);
}

async function run() {
	seed();
	await proveReads(postRoutes({ $i, userid: null }));
	await proveUpdate();
	await proveSourceContracts();
	console.log('legacyRichCompatibility.test.js PASS');
}

run()
	.catch(error => { console.error(error); process.exitCode = 1; })
	.finally(() => { packed.closeAll(); fs.rmSync(root, { recursive: true, force: true }); });
