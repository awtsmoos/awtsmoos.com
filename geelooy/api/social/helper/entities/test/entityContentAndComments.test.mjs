// B"H
/**
 * Chapter 157: Entity content proof. A plain post, structured post, question,
 * and answer all share the same entity store and rich comment tree.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { createEntityRecord, listAnswers } = require('../../socialContent.js');
const { createComment, getTree } = require('../../comments/richCommentStore.js');
const { previewVerseFromPost, deleteVerseFromPost } = require('../../editor/postStructureDeletion.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-entities-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db, $_POST: {}, $_GET: {}, request: { headers: {} } };
await db.write('/users/u1/aliases/author', { aliasId: 'author' });
await db.write('/social/aliases/author/info', { user: 'u1' });
await db.write('/social/heichelos/h1/info', { name: 'Entity Heichel', author: 'author' });

const plain = await createEntityRecord({ $i, input: { heichelId: 'h1', seriesId: 'root', aliasId: 'author', type: 'post', title: 'Plain Root', content: 'Only root content', mode: 'plain' } });
assert.equal(plain.success.entityMode, 'plain');
assert.equal(plain.success.sections.length, 0);

const structured = await createEntityRecord({ $i, input: { heichelId: 'h1', seriesId: 'root', aliasId: 'author', type: 'post', title: 'Complex', content: 'Root', sections: [{ id: 'v1', title: 'Verse', content: 'Verse body', segments: [{ id: 's1', title: 'Sub', content: 'Sub body' }] }] } });
assert.equal(structured.success.entityMode, 'structured');
assert.equal(structured.success.sections[0].segments[0].id, 's1');

const question = await createEntityRecord({ $i, input: { heichelId: 'h1', seriesId: 'root', aliasId: 'author', type: 'question', title: 'What is light?', content: 'Question root' } });
assert.equal(question.success.contentType, 'question');
const answer = await createEntityRecord({ $i, input: { heichelId: 'h1', seriesId: 'root', aliasId: 'author', type: 'answer', parentQuestionId: question.success.id, title: 'Light answer', content: 'Answer root' } });
assert.equal(answer.success.parentQuestionId, question.success.id);
assert.ok((await listAnswers({ $i, heichelId: 'h1', questionId: question.success.id })).success.length >= 1);

$i.$_POST = { aliasId: 'author', content: 'Comment on question', links: JSON.stringify([{ kind: 'post', postId: structured.success.id, label: 'Complex post' }]) };
const qComment = await createComment({ $i, userid: 'u1', heichelId: 'h1', postId: question.success.id, aliasId: 'author' });
assert.equal(qComment.success.previews[0].kind, 'post');
assert.equal((await getTree({ $i, heichelId: 'h1', postId: question.success.id })).success.length, 1);

$i.$_POST = { aliasId: 'author', content: 'Answer comment with audio note', audioNoteText: 'spoken', links: JSON.stringify([{ kind: 'comment', commentId: qComment.success.id, label: 'Question comment' }]) };
const aComment = await createComment({ $i, userid: 'u1', heichelId: 'h1', postId: answer.success.id, aliasId: 'author' });
assert.equal(aComment.success.previews[0].kind, 'comment');

$i.$_POST = { aliasId: 'author', content: 'Verse comment', verseSection: 'v1' };
const vComment = await createComment({ $i, userid: 'u1', heichelId: 'h1', postId: structured.success.id, aliasId: 'author' });
assert.ok(vComment.success.id);
const preview = await previewVerseFromPost({ $i, heichelId: 'h1', postId: structured.success.id, verseId: 'v1' });
assert.equal(preview.success.comments.totalComments, 1);
const blocked = await deleteVerseFromPost({ $i, heichelId: 'h1', postId: structured.success.id, verseId: 'v1' });
assert.equal(blocked.error.code, 'CONFIRM_REQUIRED');
$i.$_GET = { confirm: 'YES' };
const deleted = await deleteVerseFromPost({ $i, heichelId: 'h1', postId: structured.success.id, verseId: 'v1' });
assert.equal(deleted.success.comments.deleted, 1);
assert.equal(deleted.success.post.entityMode, 'plain');
console.log('B"H entityContentAndComments.test passed');
