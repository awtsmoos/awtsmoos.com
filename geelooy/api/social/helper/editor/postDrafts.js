// B"H
/**
 * @module PostDrafts
 * @description Chapter 623: editor drafts now persist in AwtsmoosDB metadata
 * shards while old DB paths remain a public mirror only.
 */
const { er } = require('../general.js');
const { put, get, key } = require('../awtsmoosDb/shardStore.js');
const { createContentRecord } = require('../socialContent.js');
const { normalizePostDraft, toContentSections } = require('./postSchema.js');
function draftKey(aliasId, draftId) { return key(['drafts', aliasId, draftId]); }
function ensureDraft(draft) {
  if (!draft.author || !draft.heichelId || !draft.title) return er({ code: 'BAD_DRAFT', message: 'author, heichelId and title are required.' });
  return null;
}
function writeDraftRecord(draft, meta = {}) {
  return put({ shard: 'meta', parts: ['drafts', draft.author, draft.id], value: draft, meta: { kind: 'postDraft', aliasId: draft.author, heichelId: draft.heichelId, ...meta } });
}
async function saveDraft({ $i }) {
  const draft = normalizePostDraft($i.$_POST || {});
  const bad = ensureDraft(draft);
  if (bad) return bad;
  draft.id = draft.id || `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  draft.submissionStatus = 'draft';
  await $i.db.write(`/social/aliases/${draft.author}/drafts/${draft.id}`, draft);
  writeDraftRecord(draft);
  return { success: draft };
}
async function readDraft({ $i, aliasId, draftId }) {
  const record = get({ shard: 'meta', parts: ['drafts', aliasId, draftId] })?.value;
  const legacy = await $i.db.get(`/social/aliases/${aliasId}/drafts/${draftId}`).catch(() => null);
  const draft = record || legacy;
  return draft ? { success: draft } : er({ code: 'DRAFT_NOT_FOUND', message: 'Draft not found.' });
}
async function publishDraft({ $i }) {
  const draftResult = await readDraft({ $i, aliasId: $i.$_POST.aliasId, draftId: $i.$_POST.draftId });
  if (!draftResult.success) return draftResult;
  const draft = draftResult.success;
  const post = await createContentRecord({ $i, heichelId: draft.heichelId, seriesId: draft.seriesId, postId: $i.$_POST.postId || draft.id.replace(/^draft_/, 'post_'), aliasId: draft.author, type: 'post', title: draft.title, content: draft.description, sections: toContentSections(draft) });
  if (!post.success) return post;
  const published = { ...draft, submissionStatus: 'published', publishedPostId: post.success.postId, publishedAt: Date.now() };
  await $i.db.write(`/social/aliases/${draft.author}/drafts/${draft.id}`, published);
  writeDraftRecord(published, { status: 'published' });
  return { success: { draft: published, post: post.success } };
}
module.exports = { saveDraft, readDraft, publishDraft, draftKey };
