//B"H
/**
 * The Awtsmoos breathes worlds through ordered states: no boolean fog,
 * only named gates where every spark knows where it stands.
 */
const STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  DELETED: 'deleted',
  ARCHIVED: 'archived'
});
const CONTENT_TYPES = Object.freeze(['post', 'question', 'answer', 'series', 'comment', 'content', 'poll']);
const ACTIONS = Object.freeze(['submit', 'approve', 'reject', 'edit', 'view', 'delete', 'archive']);
function isFinal(status) { return [STATUS.PUBLISHED, STATUS.REJECTED, STATUS.DELETED, STATUS.ARCHIVED].includes(status); }
function normalizeType(type) { const value = String(type || '').toLowerCase(); return CONTENT_TYPES.includes(value) ? value : 'content'; }
module.exports = { STATUS, CONTENT_TYPES, ACTIONS, isFinal, normalizeType };
