// B"H
/** Chapter 626: Heichel invitations now use AwtsmoosDB graph shards. */
const { er } = require('../general.js');
const { put, list } = require('../awtsmoosDb/shardStore.js');
const { requireRole, setRole } = require('./roles.js');
function inviteId() { return `invite_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
function clean(value, max = 80) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function writeInvite(invite, meta = {}) {
  return put({ shard: 'graph', parts: ['heichelInvites', invite.heichelId, invite.id], value: invite, meta: { kind: 'heichelInvite', heichelId: invite.heichelId, toAlias: invite.toAlias, role: invite.role, ...meta } });
}
async function createInvite({ $i, heichelId, actorAlias }) {
  const body = $i.$_POST || {};
  const role = clean(body.role || 'contributor', 32);
  const toAlias = clean(body.toAlias || body.aliasId, 80);
  const ok = await requireRole({ $i, heichelId, aliasId: actorAlias, action: 'invite' });
  if (ok.error) return ok;
  if (!toAlias || !['admin', 'contributor'].includes(role)) return er({ code: 'BAD_INVITE', message: 'toAlias and role=admin|contributor required.' });
  const invite = { id: inviteId(), heichelId, toAlias, role, actorAlias, status: 'pending', createdAt: Date.now() };
  await $i.db.write(`/social/heichelos/${heichelId}/invites/${invite.id}`, invite);
  writeInvite(invite);
  return { success: invite };
}
async function acceptInvite({ $i, heichelId, inviteId: id, actorAlias }) {
  const invite = await $i.db.get(`/social/heichelos/${heichelId}/invites/${id}`).catch(() => null);
  if (!invite) return er({ code: 'INVITE_NOT_FOUND', message: 'Invite not found.' });
  if (invite.toAlias !== actorAlias) return er({ code: 'NOT_INVITED_ALIAS', message: 'This invite belongs to another alias.' });
  const accepted = { ...invite, status: 'accepted', acceptedAt: Date.now() };
  await $i.db.write(`/social/heichelos/${heichelId}/invites/${id}`, accepted);
  await setRole({ $i, heichelId, aliasId: actorAlias, role: invite.role, actorAlias: invite.actorAlias });
  writeInvite(accepted, { status: 'accepted' });
  return { success: accepted };
}
async function listInvites({ $i, heichelId }) {
  const legacy = await $i.db.get(`/social/heichelos/${heichelId}/invites`).catch(() => null);
  const oldItems = legacy && typeof legacy === 'object' ? Object.values(legacy) : [];
  const records = list({ shard: 'graph', predicate: r => r.meta?.kind === 'heichelInvite' && r.value?.heichelId === heichelId }).map(r => r.value);
  return { success: [...oldItems, ...records].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i) };
}
module.exports = { createInvite, acceptInvite, listInvites };
