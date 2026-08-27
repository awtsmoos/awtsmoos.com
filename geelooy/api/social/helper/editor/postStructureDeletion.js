// B"H
/**
 * @module PostStructureDeletion
 * @description
 * Chapter 155: When a verse or subsection is removed from a post/question/answer
 * entity, comment ghosts are previewed first and then tombstoned with care.
 */

const { er } = require('../general.js');
const { deleteVerseComments, deleteSubsectionComments, previewVerseDelete, previewSubsectionDelete } = require('../comments/richCommentStore.js');

async function readPost($i, heichelId, postId) {
  return await $i.db.get(`/social/heichelos/${heichelId}/posts/${postId}`).catch(() => null);
}

async function writePost($i, post) {
  post.updatedAt = Date.now();
  await $i.db.write(`/social/heichelos/${post.heichelId}/posts/${post.postId || post.id}`, post);
  return post;
}

function withoutVerse(post, verseId) {
  const sections = Array.isArray(post.sections) ? post.sections : [];
  const kept = sections.filter(section => section.id !== verseId && section.verseSection !== verseId);
  return { ...post, entityMode: kept.length ? 'structured' : 'plain', sections: kept, verseMap: Object.fromEntries(kept.map(section => [section.verseSection || section.id, section.id])) };
}

function withoutSubsection(post, subsectionId) {
  const sections = (Array.isArray(post.sections) ? post.sections : []).map(section => ({ ...section, segments: (Array.isArray(section.segments) ? section.segments : []).filter(segment => segment.id !== subsectionId) }));
  return { ...post, sections };
}

async function previewVerseFromPost({ $i, heichelId, postId, verseId }) {
  const post = await readPost($i, heichelId, postId);
  if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Entity not found.' });
  const commentPreview = await previewVerseDelete({ $i, heichelId, postId, verseSection: verseId });
  return { success: { entityId: postId, verseId, willRemoveVerse: (post.sections || []).some(section => section.id === verseId || section.verseSection === verseId), comments: commentPreview.success } };
}

async function previewSubsectionFromPost({ $i, heichelId, postId, subsectionId }) {
  const post = await readPost($i, heichelId, postId);
  if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Entity not found.' });
  const commentPreview = await previewSubsectionDelete({ $i, heichelId, postId, subsectionId });
  return { success: { entityId: postId, subsectionId, willRemoveSubsection: (post.sections || []).some(section => (section.segments || []).some(segment => segment.id === subsectionId)), comments: commentPreview.success } };
}

async function deleteVerseFromPost({ $i, heichelId, postId, verseId }) {
  const post = await readPost($i, heichelId, postId);
  if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Entity not found.' });
  const preview = await previewVerseFromPost({ $i, heichelId, postId, verseId });
  if (preview.success.comments.requiresConfirmation && $i.$_GET?.confirm !== 'YES' && $i.$_POST?.confirm !== 'YES') return er({ code: 'CONFIRM_REQUIRED', message: 'Deleting this verse will tombstone connected comments. Send confirm=YES.', preview: preview.success });
  const updated = await writePost($i, withoutVerse(post, verseId));
  const comments = await deleteVerseComments({ $i, heichelId, postId, verseSection: verseId });
  await $i.db.write(`/social/audit/deleteCascades/${Date.now()}_${postId}_${verseId}`, { kind: 'verse', heichelId, postId, verseId, comments: comments.success, createdAt: Date.now() });
  return { success: { post: updated, comments: comments.success } };
}

async function deleteSubsectionFromPost({ $i, heichelId, postId, subsectionId }) {
  const post = await readPost($i, heichelId, postId);
  if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Entity not found.' });
  const preview = await previewSubsectionFromPost({ $i, heichelId, postId, subsectionId });
  if (preview.success.comments.requiresConfirmation && $i.$_GET?.confirm !== 'YES' && $i.$_POST?.confirm !== 'YES') return er({ code: 'CONFIRM_REQUIRED', message: 'Deleting this subsection will tombstone connected comments. Send confirm=YES.', preview: preview.success });
  const updated = await writePost($i, withoutSubsection(post, subsectionId));
  const comments = await deleteSubsectionComments({ $i, heichelId, postId, subsectionId });
  await $i.db.write(`/social/audit/deleteCascades/${Date.now()}_${postId}_${subsectionId}`, { kind: 'subsection', heichelId, postId, subsectionId, comments: comments.success, createdAt: Date.now() });
  return { success: { post: updated, comments: comments.success } };
}

module.exports = { deleteVerseFromPost, deleteSubsectionFromPost, previewVerseFromPost, previewSubsectionFromPost, withoutVerse, withoutSubsection };
