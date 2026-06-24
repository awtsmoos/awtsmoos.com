// B"H
/**
 * Chapter 536: Writing to the inbox is not replacing mail, nor replacing
 * notifications. It is a bridge record: a living pointer in the OS river.
 */
const p = require('./paths.js');
const { cleanText, cleanId, normalizeKind, nowStamp } = require('./sanitize.js');
const { getThread, listInbox } = require('./read.js');

function makeId(input = {}) {
  return cleanId(input.id || `BH_inbox_${Date.now()}_${Math.floor(Math.random() * 100000)}`);
}

function normalizeItem(input = {}, aliasId = '') {
  const alias = cleanId(aliasId || input.aliasId);
  const id = makeId(input);
  const threadId = cleanId(input.threadId || input.thread || 'general', 'general');
  const createdAt = nowStamp(input.createdAt);
  return {
    id, aliasId: alias, threadId, kind: normalizeKind(input.kind),
    title: cleanText(input.title || input.kind || 'Message', 180),
    body: cleanText(input.body || input.text || '', 2000),
    fromAliasId: cleanId(input.fromAliasId || input.senderAliasId || '', ''),
    entityType: cleanId(input.entityType || input.entity?.type || '', ''),
    entityId: cleanId(input.entityId || input.entity?.id || '', ''),
    actionUrl: cleanText(input.actionUrl || '', 500),
    createdAt, updatedAt: nowStamp(input.updatedAt || createdAt), readAt: Number(input.readAt || 0)
  };
}

async function recordInboxItem({ $i, aliasId, item = {} }) {
  const record = normalizeItem(item, aliasId);
  await $i.db.write(p.byAliasItem(record.aliasId, record.id), record);
  await $i.db.write(p.byThreadItem(record.aliasId, record.threadId, record.id), record.id);
  return { success: record };
}

async function markInboxItemRead({ $i, aliasId, itemId }) {
  const alias = cleanId(aliasId);
  const id = cleanId(itemId);
  const old = await $i.db.get(p.byAliasItem(alias, id)).catch(() => null);
  if (!old) return { error: { code: 'INBOX_ITEM_NOT_FOUND', message: 'Inbox item not found.' } };
  const next = { ...old, readAt: Date.now(), updatedAt: Date.now() };
  await $i.db.write(p.byAliasItem(alias, id), next);
  return { success: next };
}

async function markThreadRead({ $i, aliasId, threadId }) {
  const thread = await getThread({ $i, aliasId, threadId, limit: 300 });
  let count = 0;
  for (const item of thread.success || []) {
    if (!item.readAt) {
      await markInboxItemRead({ $i, aliasId, itemId: item.id });
      count++;
    }
  }
  return { success: { aliasId: cleanId(aliasId), threadId: cleanId(threadId), marked: count } };
}

async function inboxSummary({ $i, aliasId }) {
  const items = await listInbox({ $i, aliasId, limit: 5 });
  const unread = (items.success || []).filter(item => !item.readAt).length;
  return { latest: items.success || [], unread };
}

module.exports = { recordInboxItem, markInboxItemRead, markThreadRead, inboxSummary };
