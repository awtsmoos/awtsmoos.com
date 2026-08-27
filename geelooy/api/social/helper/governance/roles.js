// B"H
/** Chapter 625: Heichel roles now use AwtsmoosDB graph shards. */
const { sp } = require('../_awtsmoos.constants.js');
const { er } = require('../general.js');
const { put, list, key } = require('../awtsmoosDb/shardStore.js');
const ROLES = new Set(['owner', 'admin', 'contributor']);
async function read($i, path, fallback = null) { try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; } }
function rolePath(heichelId, aliasId) { return `${sp}/heichelos/${heichelId}/members/${aliasId}`; }
function memberKey(heichelId, aliasId) { return key(['heichelMembers', heichelId, aliasId]); }
async function heichelOwner($i, heichelId) {
  const info = await read($i, `${sp}/heichelos/${heichelId}/info`, {});
  return info.author || info.ownerAlias || '';
}
async function roleOf({ $i, heichelId, aliasId }) {
  if (!aliasId) return 'guest';
  if ((await heichelOwner($i, heichelId)) === aliasId) return 'owner';
  const member = await read($i, rolePath(heichelId, aliasId), null);
  return member?.role || 'guest';
}
function can(role, action) {
  if (role === 'owner') return true;
  if (role === 'admin') return ['invite', 'approve', 'reject', 'publish', 'submit', 'editHeichel'].includes(action);
  if (role === 'contributor') return action === 'submit';
  return false;
}
async function requireRole({ $i, heichelId, aliasId, action }) {
  const role = await roleOf({ $i, heichelId, aliasId });
  return can(role, action) ? { success: true, role } : er({ code: 'NOT_AUTHORIZED', message: `${aliasId || 'guest'} cannot ${action} in ${heichelId}`, role });
}
async function setRole({ $i, heichelId, aliasId, role, actorAlias }) {
  if (!ROLES.has(role) || role === 'owner') return er({ code: 'BAD_ROLE', message: 'Use admin or contributor for members.' });
  const record = { heichelId, aliasId, role, actorAlias, updatedAt: Date.now() };
  await $i.db.write(rolePath(heichelId, aliasId), record);
  put({ shard: 'graph', parts: ['heichelMembers', heichelId, aliasId], value: record, meta: { kind: 'heichelMember', heichelId, aliasId, role } });
  return { success: record };
}
async function listMembers({ $i, heichelId }) {
  const owner = await heichelOwner($i, heichelId);
  const legacy = await read($i, `${sp}/heichelos/${heichelId}/members`, {});
  const items = owner ? [{ aliasId: owner, role: 'owner' }] : [];
  if (legacy && typeof legacy === 'object') Object.entries(legacy).forEach(([aliasId, value]) => items.push({ aliasId, role: value.role || value }));
  const records = list({ shard: 'graph', predicate: r => r.meta?.kind === 'heichelMember' && r.value?.heichelId === heichelId }).map(r => r.value);
  return { success: [...items, ...records].filter((v, i, a) => a.findIndex(x => x.aliasId === v.aliasId && x.role === v.role) === i) };
}
module.exports = { roleOf, requireRole, setRole, listMembers, heichelOwner, can, memberKey };
