//B"H
//Blessed is He
//Boruch Hashem
const assert = require('assert');
const { addOrApproveComment } = require('../commentCreation.js');
const {
  getComment,
  getCommentsByAliasAtVerseSection,
  getAuthorsCommentingAtVerseSectionInParent
} = require('../commentRetrieval.js');
const { editComment } = require('../commentModification.js');
const { deleteComment } = require('../commentDeletion.js');
const { createFakeDb } = require('./commentTreeFakeDb.js');

async function add($i, { aliasId, userid, parentType, parentId, postId, verseSection, content }) {
  $i.$_POST = { content, dayuh: JSON.stringify({ verseSection }) };
  const added = await addOrApproveComment({
    $i,
    parentType,
    parentId,
    postId,
    heichelId: 'h1',
    aliasId,
    userid,
    seriesId: 'root'
  });
  assert.equal(added.success, true, JSON.stringify(added));
  return added.details.id;
}

(async () => {
  const $i = { $_GET: {}, $_POST: {}, $_PUT: {}, $_DELETE: {}, db: createFakeDb(), fetchAwtsmoos: async () => [] };

  const rootId = await add($i, { aliasId: 'alice', userid: 'u1', parentType: 'post', parentId: 'post1', postId: 'post1', verseSection: 'root', content: 'root comment' });
  const sectionId = await add($i, { aliasId: 'alice', userid: 'u1', parentType: 'post', parentId: 'post1', postId: 'post1', verseSection: 'sec-2', content: 'section comment' });
  const replyId = await add($i, { aliasId: 'bob', userid: 'u2', parentType: 'comment', parentId: rootId, postId: 'post1', verseSection: 'reply-sec', content: 'reply to root comment' });

  const rootComments = await getCommentsByAliasAtVerseSection({ $i, aliasId: 'alice', parentType: 'post', parentId: 'post1', heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'root' });
  assert.equal(rootComments.success.length, 1);
  assert.equal(rootComments.success[0].id, rootId);

  const sectionComments = await getCommentsByAliasAtVerseSection({ $i, aliasId: 'alice', parentType: 'post', parentId: 'post1', heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'sec-2' });
  assert.equal(sectionComments.success[0].id, sectionId);

  const replyComments = await getCommentsByAliasAtVerseSection({ $i, aliasId: 'bob', parentType: 'comment', parentId: rootId, heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'reply-sec' });
  assert.equal(replyComments.success[0].id, replyId);

  const exact = await getComment({ $i, commentId: sectionId, aliasId: 'alice', parentType: 'post', parentId: 'post1', heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'sec-2' });
  assert.equal(exact.content, 'section comment');

  const edit = await editComment({ $i, commentId: sectionId, aliasId: 'alice', parentType: 'post', parentId: 'post1', heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'sec-2', newContent: 'edited section comment', userid: 'u1' });
  assert.equal(edit.success, true, JSON.stringify(edit));
  const edited = await getComment({ $i, commentId: sectionId, aliasId: 'alice', parentType: 'post', parentId: 'post1', heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'sec-2' });
  assert.equal(edited.content, 'edited section comment');

  const authors = await getAuthorsCommentingAtVerseSectionInParent({ $i, parentType: 'post', parentId: 'post1', heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'sec-2' });
  assert.ok(authors.success.includes('alice'), JSON.stringify(authors));

  const deleted = await deleteComment({ $i, commentId: replyId, aliasId: 'bob', parentType: 'comment', parentId: rootId, heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'reply-sec', userid: 'u2' });
  assert.equal(deleted.success, true, JSON.stringify(deleted));
  const afterDelete = await getCommentsByAliasAtVerseSection({ $i, aliasId: 'bob', parentType: 'comment', parentId: rootId, heichelId: 'h1', postId: 'post1', seriesId: 'root', verseSection: 'reply-sec' });
  assert.equal(afterDelete.success.length, 0);

  console.log('B"H commentTreeSectionEditDelete.test passed');
})().catch(error => { console.error(error); process.exit(1); });