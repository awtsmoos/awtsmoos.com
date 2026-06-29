//B"H
/**
 * Pending vessels wait before the gate. Approval now holds a small in-process
 * lock so two moderators cannot reveal the same spark twice in one server body.
 */
const { STATUS, normalizeType } = require('./statuses.js');
const { canSubmit, canApprove, canReject } = require('./permissionEngine.js');
const { emit } = require('./eventBus.js');
const { sp } = require('../_awtsmoos.constants.js');
const transitionLocks = new Set();
function root(heichelId) { return `${sp}/heichelos/${heichelId}/reviews`; }
function itemPath(heichelId, id) { return `${root(heichelId)}/all/${id}`; }
function idFor(type) { return `BH_review_${type}_${Date.now()}_${Math.floor(Math.random() * 100000)}`; }
async function createReview({ $i, heichelId, aliasId, contentType, payload = {}, verifyHeichelAuthority }) {
  const type = normalizeType(contentType);
  if (!(await canSubmit({ $i, heichelId, aliasId, contentType: type, verifyHeichelAuthority }))) return { error: { code: 'NO_SUBMIT_PERMISSION' } };
  const record = { id: payload.id || idFor(type), heichelId, aliasId, contentType: type, payload, status: STATUS.PENDING, history: [{ status: STATUS.PENDING, at: Date.now(), by: aliasId }], createdAt: Date.now(), updatedAt: Date.now() };
  await $i.db.write(itemPath(heichelId, record.id), record);
  await emit({ $i, type: 'SubmissionCreated', payload: record });
  return { success: record };
}
async function listReview({ $i, heichelId, status = STATUS.PENDING, contentType, limit = 50, offset = 0, search = '' }) {
  const found = await $i.db.get(`${root(heichelId)}/all`).catch(() => null);
  let list = found && typeof found === 'object' ? Object.values(found) : [];
  if (status) list = list.filter(item => item.status === status);
  if (contentType) list = list.filter(item => item.contentType === normalizeType(contentType));
  if (search) list = list.filter(item => JSON.stringify(item).toLowerCase().includes(String(search).toLowerCase()));
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const start = Number(offset) || 0;
  const size = Number(limit) || 50;
  return { success: { items: list.slice(start, start + size), total: list.length, offset: start, limit: size, hasMore: start + size < list.length } };
}
async function transition({ $i, heichelId, reviewId, aliasId, status, note = '', verifyHeichelAuthority }) {
  const allowed = status === STATUS.APPROVED ? await canApprove({ $i, heichelId, aliasId, verifyHeichelAuthority }) : await canReject({ $i, heichelId, aliasId, verifyHeichelAuthority });
  if (!allowed) return { error: { code: 'NO_MODERATION_PERMISSION' } };
  const lockKey = `${heichelId}:${reviewId}`;
  if (transitionLocks.has(lockKey)) return { error: { code: 'ALREADY_REVIEWED', status: 'transitioning' } };
  transitionLocks.add(lockKey);
  try {
    const path = itemPath(heichelId, reviewId);
    const current = await $i.db.get(path).catch(() => null);
    if (!current) return { error: { code: 'NOT_FOUND' } };
    if (current.status !== STATUS.PENDING) return { error: { code: 'ALREADY_REVIEWED', status: current.status } };
    const next = { ...current, status, note, updatedAt: Date.now(), history: [...(current.history || []), { status, at: Date.now(), by: aliasId, note }] };
    await $i.db.write(path, next);
    await emit({ $i, type: status === STATUS.APPROVED ? 'SubmissionApproved' : 'SubmissionRejected', payload: next });
    return { success: next };
  } finally {
    transitionLocks.delete(lockKey);
  }
}
module.exports = { createReview, listReview, approveReview: params => transition({ ...params, status: STATUS.APPROVED }), rejectReview: params => transition({ ...params, status: STATUS.REJECTED }), itemPath, root };
