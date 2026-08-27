//B"H
/**
 * Moderation queue engine.
 * Chapter 302: the Awtsmoos refines the gate again, so "all" means all,
 * hidden fields stay hidden, and every page is measured before it appears.
 */
const { STATUS, normalizeType } = require('./statuses.js');
const { canSubmit, canApprove, canReject } = require('./permissionEngine.js');
const { clampPagination } = require('./pagination.js');
const { emit } = require('./eventBus.js');
const { sp } = require('../_awtsmoos.constants.js');
const transitionLocks = new Set();
function root(heichelId) { return `${sp}/heichelos/${heichelId}/reviews`; }
function itemPath(heichelId, id) { return `${root(heichelId)}/all/${id}`; }
function idFor(type) { return `BH_review_${type}_${Date.now()}_${Math.floor(Math.random() * 100000)}`; }
function openFilter(value) { return ['all', 'any', '*'].includes(String(value || '').trim().toLowerCase()); }
function statusFilter(value) { const text = String(value || STATUS.PENDING).toLowerCase(); if (openFilter(text)) return ''; return Object.values(STATUS).includes(text) ? text : STATUS.PENDING; }
function typeFilter(value) { const text = String(value || '').trim().toLowerCase(); return !text || openFilter(text) ? '' : normalizeType(text); }
function textOf(record) {
  const p = record.payload || {};
  return [record.id, record.aliasId, record.contentType, record.status, record.note, p.id, p.title, p.name, p.content, p.body, p.text, p.summary, p.description, p.questionId, p.postId, p.seriesId, p.parentQuestionId, p.parentId, p.aliasId].filter(Boolean).join(' ').toLowerCase();
}
function newestFirst(a, b) { return (b.createdAt || 0) - (a.createdAt || 0) || String(b.id || '').localeCompare(String(a.id || '')); }
async function createReview({ $i, heichelId, aliasId, contentType, payload = {}, verifyHeichelAuthority }) {
  const type = normalizeType(contentType);
  const allowed = await canSubmit({ $i, heichelId, aliasId, contentType: type, verifyHeichelAuthority });
  if (!allowed) return { error: { code: 'NO_SUBMIT_PERMISSION' } };
  const now = Date.now();
  const record = { id: payload.id || idFor(type), heichelId, aliasId, contentType: type, payload, status: STATUS.PENDING, history: [{ status: STATUS.PENDING, at: now, by: aliasId }], createdAt: now, updatedAt: now };
  await $i.db.write(itemPath(heichelId, record.id), record);
  await emit({ $i, type: 'SubmissionCreated', payload: record });
  return { success: record };
}
async function listReview({ $i, heichelId, status = STATUS.PENDING, contentType, limit = 50, offset = 0, search = '' }) {
  const found = await $i.db.get(`${root(heichelId)}/all`).catch(() => null);
  const page = clampPagination({ limit, offset });
  const wantedStatus = statusFilter(status);
  const wantedType = typeFilter(contentType);
  const needle = String(search || '').toLowerCase();
  let list = found && typeof found === 'object' ? Object.values(found) : [];
  if (wantedStatus) list = list.filter(item => item.status === wantedStatus);
  if (wantedType) list = list.filter(item => item.contentType === wantedType);
  if (needle) list = list.filter(item => textOf(item).includes(needle));
  list.sort(newestFirst);
  return { success: { items: list.slice(page.offset, page.offset + page.limit), total: list.length, offset: page.offset, limit: page.limit, hasMore: page.offset + page.limit < list.length } };
}
async function transition({ $i, heichelId, reviewId, aliasId, status, note = '', verifyHeichelAuthority }) {
  const approver = status === STATUS.APPROVED;
  const allowed = approver ? await canApprove({ $i, heichelId, aliasId, verifyHeichelAuthority }) : await canReject({ $i, heichelId, aliasId, verifyHeichelAuthority });
  if (!allowed) return { error: { code: 'NO_MODERATION_PERMISSION' } };
  const lockKey = `${heichelId}:${reviewId}`;
  if (transitionLocks.has(lockKey)) return { error: { code: 'ALREADY_REVIEWED', status: 'transitioning' } };
  transitionLocks.add(lockKey);
  try {
    const path = itemPath(heichelId, reviewId);
    const current = await $i.db.get(path).catch(() => null);
    if (!current) return { error: { code: 'NOT_FOUND' } };
    if (current.status !== STATUS.PENDING) return { error: { code: 'ALREADY_REVIEWED', status: current.status } };
    const now = Date.now();
    const next = { ...current, status, note, updatedAt: now, history: [...(current.history || []), { status, at: now, by: aliasId, note }] };
    await $i.db.write(path, next);
    await emit({ $i, type: approver ? 'SubmissionApproved' : 'SubmissionRejected', payload: next });
    return { success: next };
  } finally { transitionLocks.delete(lockKey); }
}
module.exports = { createReview, listReview, approveReview: params => transition({ ...params, status: STATUS.APPROVED }), rejectReview: params => transition({ ...params, status: STATUS.REJECTED }), itemPath, root, statusFilter, typeFilter };
