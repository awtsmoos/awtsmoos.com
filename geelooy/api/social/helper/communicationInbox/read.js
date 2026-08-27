// B"H
/**
 * Chapter 535: Reading the inbox means gathering chat sparks and notification
 * bells into one river without moving the older riverbeds.
 */
const p = require('./paths.js');
const { cleanId, cleanLimit } = require('./sanitize.js');

async function readChildren($i, path) {
  const raw = await $i.db.get(path).catch(() => null);
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') return Object.values(raw);
  return [];
}

async function hydrate($i, alias, value) {
  if (value && typeof value === 'object' && value.id) return value;
  const id = typeof value === 'string' ? value : value?.id;
  if (!id) return null;
  return await $i.db.get(p.byAliasItem(alias, id)).catch(() => null);
}

async function listInbox({ $i, aliasId, limit = 50 }) {
  const alias = cleanId(aliasId);
  const rows = [];
  for (const value of await readChildren($i, p.byAlias(alias))) {
    const item = await hydrate($i, alias, value);
    if (item && !item.deleted) rows.push(item);
  }
  rows.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  return { success: rows.slice(0, cleanLimit(limit)) };
}

async function getThread({ $i, aliasId, threadId, limit = 100 }) {
  const alias = cleanId(aliasId);
  const thread = cleanId(threadId, 'general');
  const rows = [];
  for (const value of await readChildren($i, p.byThread(alias, thread))) {
    const item = await hydrate($i, alias, value);
    if (item && !item.deleted) rows.push(item);
  }
  rows.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return { success: rows.slice(-cleanLimit(limit, 100, 300)) };
}

async function countUnread({ $i, aliasId }) {
  const list = await listInbox({ $i, aliasId, limit: 200 });
  const unread = (list.success || []).filter(item => !item.readAt).length;
  return { success: { aliasId: cleanId(aliasId), count: unread } };
}

module.exports = { listInbox, getThread, countUnread };
