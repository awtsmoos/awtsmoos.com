//B"H
/**
 * @module NotificationCenter
 * @description Chapter 650: every bell receives a unique name before it rings.
 * Notifications keep pagination, read/archive/delete states, preferences, and
 * mirrors, while tight creation loops can no longer overwrite same-path notes.
 */
const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');
const { put } = require('./awtsmoosDb/shardStore.js');
const { clampPagination } = require('./community/pagination.js');
const NOTIFICATION_TYPES = ['submission_created','submission_approved','submission_rejected','comment','comment_approved','comment_rejected','mention','reply','moderator_action','admin_action','invitation','series_updated','post_edited','new_follower','alias_event','mail_event','heichel_announcement','system','answer','repost','share','approval','chat'];
let noteSeq = 0;
function clean(value, fallback = '') { return String(value || fallback).trim(); }
function root(aliasId) { return `${sp}/aliases/${aliasId}/notifications`; }
function path(aliasId, noteId) { return `${root(aliasId)}/${noteId}`; }
function prefsPath(aliasId) { return `${sp}/aliases/${aliasId}/notificationPreferences`; }
function id(type) { noteSeq = (noteSeq + 1) % Number.MAX_SAFE_INTEGER; return `BH_note_${type}_${Date.now()}_${process.hrtime.bigint().toString(36)}_${noteSeq.toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
function kind(type) { const value = clean(type || 'system'); return NOTIFICATION_TYPES.includes(value) ? value : 'system'; }
function typeFilter(value) { const text = clean(value).toLowerCase(); return !text || ['all', 'any', '*'].includes(text) ? '' : kind(text); }
function mirror(record) { try { return put({ shard: 'notify', parts: ['notifications', record.toAliasId, record.id], value: record, meta: { kind: 'notification', type: record.type, toAliasId: record.toAliasId } }); } catch (error) { return { ok: false, mirrorError: error.message }; } }
function searchable(record) { return [record.id, record.type, record.title, record.body, record.actionUrl, record.fromAliasId, record.groupKey, record.entity?.id, record.entity?.type, record.entity?.title].filter(Boolean).join(' ').toLowerCase(); }
async function createNotification({ $i, toAliasId, fromAliasId = '', type = 'system', title = '', body = '', entity = {}, actionUrl = '', groupKey = '' }) {
  const target = clean(toAliasId); if (!target) return er({ code: 'MISSING_ALIAS', message: 'Notification target alias is required.' });
  const record = { id: id(kind(type)), type: kind(type), toAliasId: target, fromAliasId: clean(fromAliasId), title: clean(title || type), body: clean(body), entity: entity && typeof entity === 'object' ? entity : {}, actionUrl: clean(actionUrl), groupKey: clean(groupKey), read: false, archived: false, deleted: false, createdAt: Date.now(), readAt: null, archivedAt: null, deletedAt: null };
  await $i.db.write(path(target, record.id), record); mirror(record); return { success: record };
}
async function recordsFor({ $i, aliasId }) {
  const records = await $i.db.get(root(aliasId)).catch(() => null);
  if (Array.isArray(records)) return (await Promise.all(records.map(item => $i.db.get(path(aliasId, item)).catch(() => null)))).filter(Boolean);
  return records && typeof records === 'object' ? Object.values(records).filter(Boolean) : [];
}
async function listNotifications({ $i, aliasId, includeRead = true, includeArchived = false, type = '', search = '', limit = 50, offset = 0 }) {
  const target = clean(aliasId || $i.$_GET?.aliasId); if (!target) return er({ code: 'MISSING_ALIAS', message: 'aliasId is required.' });
  const page = clampPagination({ limit, offset });
  const wantedType = typeFilter(type);
  const needle = String(search || '').toLowerCase();
  let list = await recordsFor({ $i, aliasId: target });
  list = list.filter(item => !item.deleted && (includeArchived || !item.archived) && (includeRead || !item.read));
  if (wantedType) list = list.filter(item => item.type === wantedType);
  if (needle) list = list.filter(item => searchable(item).includes(needle));
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || String(b.id || '').localeCompare(String(a.id || '')));
  return { success: { items: list.slice(page.offset, page.offset + page.limit), total: list.length, offset: page.offset, limit: page.limit, hasMore: page.offset + page.limit < list.length } };
}
async function updateOne({ $i, aliasId, notificationId, patch }) {
  const target = clean(aliasId); const nid = clean(notificationId); if (!target || !nid) return er({ code: 'MISSING_PARAMS' });
  const current = await $i.db.get(path(target, nid)).catch(() => null); if (!current) return er({ code: 'NOT_FOUND' });
  const next = { ...current, ...patch }; await $i.db.write(path(target, nid), next); mirror(next); return { success: next };
}
async function markNotificationRead(args) { return updateOne({ ...args, patch: { read: true, readAt: Date.now() } }); }
async function archiveNotification(args) { return updateOne({ ...args, patch: { archived: true, archivedAt: Date.now() } }); }
async function deleteNotification(args) { return updateOne({ ...args, patch: { deleted: true, deletedAt: Date.now() } }); }
async function countUnreadNotifications({ $i, aliasId }) { const list = await listNotifications({ $i, aliasId, includeRead: false }); return list.success ? { success: { count: list.success.total } } : list; }
async function markAllNotificationsRead({ $i, aliasId }) { const all = await recordsFor({ $i, aliasId }); let count = 0; for (const item of all) if (!item.read && !item.deleted) { await markNotificationRead({ $i, aliasId, notificationId: item.id }); count++; } return { success: { count } }; }
async function pollNotifications({ $i, aliasId, since = 0 }) { const all = await recordsFor({ $i, aliasId }); const fresh = all.filter(item => !item.deleted && !item.archived && Number(item.createdAt || 0) > Number(since || 0)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); return { success: fresh.slice(0, 100), cursor: Date.now(), hasMore: fresh.length > 100 }; }
async function fanoutNotification({ $i, toAliases = [], ...rest }) { const targets = Array.isArray(toAliases) ? toAliases : String(toAliases || '').split(',').map(x => x.trim()).filter(Boolean); if (!targets.length) return er({ code: 'MISSING_TARGETS' }); const out = []; for (const toAliasId of [...new Set(targets)]) { const made = await createNotification({ $i, toAliasId, ...rest }); if (made.success) out.push(made.success); } return { success: out }; }
async function getNotificationPreferences({ $i, aliasId }) { return { success: (await $i.db.get(prefsPath(aliasId)).catch(() => null)) || { live: true, pushReady: true, emailReady: true, mobileReady: true, mutedTypes: [] } }; }
async function updateNotificationPreferences({ $i, aliasId, patch = {} }) { const cur = (await getNotificationPreferences({ $i, aliasId })).success; const next = { ...cur, ...patch }; await $i.db.write(prefsPath(aliasId), next); return { success: next }; }
module.exports = { NOTIFICATION_TYPES, createNotification, listNotifications, markNotificationRead, countUnreadNotifications, pollNotifications, fanoutNotification, mirrorNotification: mirror, markAllNotificationsRead, archiveNotification, deleteNotification, getNotificationPreferences, updateNotificationPreferences, typeFilter };
