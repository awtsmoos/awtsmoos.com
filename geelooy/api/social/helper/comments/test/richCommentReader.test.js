// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Dedicated rich-comment reader regression.
 * @description
 * The Awtsmoos proves indexed/paginated reads live in `social.richComments.v1`
 * while generic `$i.db.get/write` are forbidden and deliberately explosive.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const paths = require('../richCommentPaths.js');
const access = require('../richCommentAccess.js');
const packed = require('../richDb/PackedStore.js');
const reader = require('../richCommentReader.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-rich-reader-'));
let genericCalls = 0;
const $i = {
	db: {
		directory: root,
		async get() { genericCalls++; throw new Error('generic get forbidden'); },
		async write() { genericCalls++; throw new Error('generic write forbidden'); }
	}
};
const heichelId = 'ikar';
const postId = 'post-safe';
const ctx = extra => ({ heichelId, postId, ...extra });
const comment = (id, verseSection, subsectionId = '', parentId = '') => ({
	id, heichelId, postId, verseSection, subsectionId, parentId, deleted: false, content: id
});

function seed() {
	access.write($i, paths.rootChildrenPath(ctx({})), ['root0', 'root1', 'root2']);
	access.write($i, paths.verseIndexPath(ctx({ verseSection: '0' })), ['reply0', 'root0']);
	access.write($i, paths.subsectionIndexPath(ctx({ subsectionId: 's1' })), ['root1']);
	access.write($i, paths.commentPath(ctx({ commentId: 'root0' })), comment('root0', '0', 's0'));
	access.write($i, paths.commentPath(ctx({ commentId: 'reply0' })), comment('reply0', '0', '', 'root0'));
	access.write($i, paths.commentPath(ctx({ commentId: 'root1' })), comment('root1', '1', 's1'));
	access.write($i, paths.commentPath(ctx({ commentId: 'root2' })), comment('root2', '2', 's2'));
	access.write($i, paths.childIndexPath(ctx({ commentId: 'root0' })), ['reply0']);
	access.write($i, paths.childIndexPath(ctx({ commentId: 'reply0' })), []);
	access.write($i, paths.childIndexPath(ctx({ commentId: 'root1' })), []);
	access.write($i, paths.childIndexPath(ctx({ commentId: 'root2' })), []);
}

async function run() {
	seed();
	assert.equal(fs.existsSync(packed.dbFile($i)), true);
	const zero = await reader.getTree({ $i, heichelId, postId, verseSection: '0', limit: 10 });
	assert.equal(zero.meta.index, 'verse');
	assert.deepStrictEqual(zero.success.map(row => row.id), ['root0']);
	assert.equal(zero.success[0].replies[0].id, 'reply0');

	const subsection = await reader.getTree({ $i, heichelId, postId, subsectionId: 's1', limit: 10 });
	assert.equal(subsection.meta.index, 'subsection');
	assert.deepStrictEqual(subsection.success.map(row => row.id), ['root1']);

	const paged = await reader.getTree({ $i, heichelId, postId, offset: 1, limit: 1 });
	assert.equal(paged.meta.index, 'roots');
	assert.deepStrictEqual(paged.success.map(row => row.id), ['root1']);
	assert.equal(paged.meta.scannedIds, 1);

	const replies = await reader.getReplies({ $i, heichelId, postId, commentId: 'root0', limit: 1 });
	assert.deepStrictEqual(replies.success.map(row => row.id), ['reply0']);
	assert.equal(genericCalls, 0);
	console.log('richCommentReader.test.js PASS');
}

run()
	.catch(error => { console.error(error); process.exitCode = 1; })
	.finally(() => { packed.closeAll(); fs.rmSync(root, { recursive: true, force: true }); });
