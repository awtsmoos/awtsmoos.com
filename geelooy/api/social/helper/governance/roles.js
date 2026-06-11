// B"H
/**
 * @module HeichelRoles
 * @description
 * Chapter 121: Owner, admin, contributor, guest. Every Heichel action consults
 * this living role map while legacy owner fields remain honored.
 */

const { sp } = require('../_awtsmoos.constants.js');
const { er } = require('../general.js');
const { logicalKey } = require('../packed/shardPaths.js');
const { writePacked, listPackedRecords } = require('../packed/socialPacked.js');

const ROLES = new Set(['owner', 'admin', 'contributor']);

async function read($i, path, fallback = null) {
  try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; }
}

function rolePath(heichelId, aliasId) {
  return `${sp}/heichelos/${heichelId}/members/${aliasId}`;
}

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
  if (role === 'contributor') return ['submit'].includes(action);
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
  writePacked({ $i, shard: 'graph', key: logicalKey(['heichelMembers', heichelId, aliasId]), value: record, meta: { kind: 'heichelMember', heichelId, aliasId, role } });
  return { success: record };
}

async function listMembers({ $i, heichelId }) {
  const owner = await heichelOwner($i, heichelId);
  const legacy = await read($i, `${sp}/heichelos/${heichelId}/members`, {});
  const items = owner ? [{ aliasId: owner, role: 'owner' }] : [];
  if (legacy && typeof legacy === 'object') Object.entries(legacy).forEach(([aliasId, value]) => items.push({ aliasId, role: value.role || value }));
  const packed = listPackedRecords({ $i, shard: 'graph' }).map(r => r.value).filter(v => v?.heichelId === heichelId && v?.aliasId && v?.role);
  return { success: [...items, ...packed].filter((v, i, a) => a.findIndex(x => x.aliasId === v.aliasId && x.role === v.role) === i) };
}

module.exports = { roleOf, requireRole, setRole, listMembers, heichelOwner, can };
