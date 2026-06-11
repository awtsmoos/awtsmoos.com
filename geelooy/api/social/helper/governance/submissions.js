// B"H
/**
 * @module HeichelSubmissions
 * @description
 * Chapter 123: Contributors submit, admins approve, owners publish. The post
 * body remains structured and is mirrored through the AwtsmoosDB sidecar.
 */

const { er } = require('../general.js');
const { logicalKey } = require('../packed/shardPaths.js');
const { writePacked } = require('../packed/socialPacked.js');
const { createContentRecord } = require('../socialContent.js');
const { requireRole } = require('./roles.js');

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function bodySections(body) {
  if (Array.isArray(body.sections)) return body.sections;
  if (Array.isArray(body.verses)) return body.verses;
  try { return JSON.parse(body.sections || body.verses || '[]'); } catch { return []; }
}

async function submitPost({ $i, heichelId, actorAlias }) {
  const allowed = await requireRole({ $i, heichelId, aliasId: actorAlias, action: 'submit' });
  if (allowed.error) return allowed;
  const body = $i.$_POST || {};
  if (!body.title) return er({ code: 'NO_TITLE', message: 'Title is required.' });
  const submission = { id: id('submission'), heichelId, seriesId: body.seriesId || 'root', aliasId: actorAlias, title: body.title, content: body.content || '', sections: bodySections(body), assets: parseAssets(body.assets), status: allowed.role === 'owner' || allowed.role === 'admin' ? 'approved' : 'submitted', createdAt: Date.now() };
  await $i.db.write(`/social/heichelos/${heichelId}/submissions/${submission.id}`, submission);
  writePacked({ $i, shard: 'meta', key: logicalKey(['submissions', heichelId, submission.id]), value: submission, meta: { kind: 'postSubmission', heichelId, aliasId: actorAlias, status: submission.status } });
  return { success: submission };
}

function parseAssets(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

async function reviewSubmission({ $i, heichelId, submissionId, actorAlias, status }) {
  const allowed = await requireRole({ $i, heichelId, aliasId: actorAlias, action: status === 'approved' ? 'approve' : 'reject' });
  if (allowed.error) return allowed;
  const current = await $i.db.get(`/social/heichelos/${heichelId}/submissions/${submissionId}`).catch(() => null);
  if (!current) return er({ code: 'SUBMISSION_NOT_FOUND', message: 'Submission not found.' });
  const reviewed = { ...current, status, reviewedBy: actorAlias, reviewedAt: Date.now(), reviewNote: $i.$_POST?.note || '' };
  await $i.db.write(`/social/heichelos/${heichelId}/submissions/${submissionId}`, reviewed);
  writePacked({ $i, shard: 'meta', key: logicalKey(['submissions', heichelId, submissionId]), value: reviewed, meta: { kind: 'postSubmission', status } });
  return { success: reviewed };
}

async function publishSubmission({ $i, heichelId, submissionId, actorAlias }) {
  const allowed = await requireRole({ $i, heichelId, aliasId: actorAlias, action: 'publish' });
  if (allowed.error) return allowed;
  const submission = await $i.db.get(`/social/heichelos/${heichelId}/submissions/${submissionId}`).catch(() => null);
  if (!submission || !['approved', 'published'].includes(submission.status)) return er({ code: 'SUBMISSION_NOT_APPROVED', message: 'Approve before publishing.' });
  const post = await createContentRecord({ $i, heichelId, seriesId: submission.seriesId, postId: submission.postId || id('post'), aliasId: submission.aliasId, type: 'post', title: submission.title, content: submission.content, sections: submission.sections });
  if (!post.success) return post;
  const published = { ...submission, status: 'published', postId: post.success.postId, publishedBy: actorAlias, publishedAt: Date.now() };
  await $i.db.write(`/social/heichelos/${heichelId}/submissions/${submissionId}`, published);
  return { success: { submission: published, post: post.success } };
}

async function listSubmissions({ $i, heichelId }) {
  const root = await $i.db.get(`/social/heichelos/${heichelId}/submissions`).catch(() => null);
  return { success: root && typeof root === 'object' ? Object.values(root) : [] };
}

module.exports = { submitPost, reviewSubmission, publishSubmission, listSubmissions };
