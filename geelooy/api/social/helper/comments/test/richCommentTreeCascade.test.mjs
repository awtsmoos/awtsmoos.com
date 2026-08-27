// B"H
/**
 * Chapter 160: Rich comment tree proof. Text, audio notes, images/GIFs, links,
 * unique URLs, replies, preview-before-delete, and verse/subsection cascades are
 * verified with real DosDB writes.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { createComment, getTree, getCommentByUnique, deleteVerseComments, deleteSubsectionComments, previewVerseDelete } = require('../richCommentStore.js');
const { deleteVerseFromPost } = require('../../editor/postStructureDeletion.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-rich-comments-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db, $_GET: {}, $_POST: {}, $_DELETE: {}, request: { headers: {} } };
const heichelId = 'h_rich';
const postId = 'post_rich';
await db.write('/users/u1/aliases/alice', { aliasId: 'alice' });
await db.write('/users/u2/aliases/bob', { aliasId: 'bob' });
await db.write('/social/aliases/alice/info', { user: 'u1' });
await db.write('/social/aliases/bob/info', { user: 'u2' });
await db.write(`/social/heichelos/${heichelId}/posts/${postId}`, { heichelId, id: postId, postId, sections: [{ id: 'v1', verseSection: 'v1', segments: [{ id: 's1' }] }, { id: 'v2', verseSection: 'v2', segments: [] }] });

$i.$_POST = { aliasId: 'alice', content: 'Root text with image and post link', verseSection: 'v1', subsectionId: 's1', assets: JSON.stringify([{ id: 'gif1', type: 'image', mime: 'image/gif', publicPath: '/api/social/assets/alice/image/gif1.gif' }, { id: 'audio1', type: 'audio', mime: 'audio/wav', publicPath: '/api/social/assets/alice/audio/audio1.wav' }]), links: JSON.stringify([{ kind: 'post', postId: 'otherPost', label: 'Other Post' }]), audioNoteText: 'spoken note' };
const root = await createComment({ $i, userid: 'u1', heichelId, postId, aliasId: 'alice' });
assert.ok(root.success.id, JSON.stringify(root));
assert.equal(root.success.assets.length, 2);
assert.equal(root.success.previews[0].kind, 'post');
assert.ok(root.success.url.includes(root.success.id));

$i.$_POST = { aliasId: 'bob', content: 'reply linking to root', verseSection: 'v1', links: JSON.stringify([{ kind: 'comment', commentId: root.success.id, label: 'Parent Comment' }]) };
const reply = await createComment({ $i, userid: 'u2', heichelId, postId, parentId: root.success.id, aliasId: 'bob' });
assert.equal(reply.success.parentId, root.success.id);
assert.equal(reply.success.previews[0].kind, 'comment');

const byUrl = await getCommentByUnique({ $i, commentId: root.success.id });
assert.equal(byUrl.success.id, root.success.id);
const tree = await getTree({ $i, heichelId, postId });
assert.equal(tree.success.length, 1);
assert.equal(tree.success[0].replies[0].id, reply.success.id);

const goneSub = await deleteSubsectionComments({ $i, heichelId, postId, subsectionId: 's1' });
assert.equal(goneSub.success.deleted, 2);
assert.equal((await getTree({ $i, heichelId, postId })).success.length, 0);

$i.$_POST = { aliasId: 'alice', content: 'second root on v2', verseSection: 'v2' };
const second = await createComment({ $i, userid: 'u1', heichelId, postId, aliasId: 'alice' });
assert.ok(second.success.id);
const versePreview = await previewVerseDelete({ $i, heichelId, postId, verseSection: 'v2' });
assert.equal(versePreview.success.totalComments, 1);
const blockedVerse = await deleteVerseFromPost({ $i, heichelId, postId, verseId: 'v2' });
assert.equal(blockedVerse.error.code, 'CONFIRM_REQUIRED');
$i.$_GET = { confirm: 'YES' };
const goneVerse = await deleteVerseFromPost({ $i, heichelId, postId, verseId: 'v2' });
assert.equal(goneVerse.success.comments.deleted, 1);
assert.equal(goneVerse.success.post.sections.some(section => section.id === 'v2'), false);
assert.equal((await getTree({ $i, heichelId, postId })).success.length, 0);
$i.$_GET = {};

$i.$_POST = { aliasId: 'alice', content: 'third root on v1', verseSection: 'v1' };
const third = await createComment({ $i, userid: 'u1', heichelId, postId, aliasId: 'alice' });
const directVerse = await deleteVerseComments({ $i, heichelId, postId, verseSection: 'v1' });
assert.equal(directVerse.success.deleted, 1);
assert.equal(third.success.deleted, false);
console.log('B"H richCommentTreeCascade.test passed');
