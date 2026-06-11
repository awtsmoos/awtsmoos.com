// B"H
/**
 * @module HeichelInvites
 * @description
 * Chapter 122: Invitations let owners and admins call contributors into the
 * palace without handing them the crown.
 */

const { er } = require('../general.js');
const { logicalKey } = require('../packed/shardPaths.js');
const { writePacked, listPackedRecords } = require('../packed/socialPacked.js');
const { requireRole, setRole } = require('./roles.js');

function inviteId() {
  return `invite_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function clean(value, max = 80) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
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
  writePacked({ $i, shard: 'graph', key: logicalKey(['heichelInvites', heichelId, invite.id]), value: invite, meta: { kind: 'heichelInvite', heichelId, toAlias, role } });
  return { success: invite };
}

async function acceptInvite({ $i, heichelId, inviteId: id, actorAlias }) {
  const invite = await $i.db.get(`/social/heichelos/${heichelId}/invites/${id}`).catch(() => null);
  if (!invite) return er({ code: 'INVITE_NOT_FOUND', message: 'Invite not found.' });
  if (invite.toAlias !== actorAlias) return er({ code: 'NOT_INVITED_ALIAS', message: 'This invite belongs to another alias.' });
  const accepted = { ...invite, status: 'accepted', acceptedAt: Date.now() };
  await $i.db.write(`/social/heichelos/${heichelId}/invites/${id}`, accepted);
  await setRole({ $i, heichelId, aliasId: actorAlias, role: invite.role, actorAlias: invite.actorAlias });
  writePacked({ $i, shard: 'graph', key: logicalKey(['heichelInvites', heichelId, id]), value: accepted, meta: { kind: 'heichelInvite', status: 'accepted' } });
  return { success: accepted };
}

async function listInvites({ $i, heichelId }) {
  const legacy = await $i.db.get(`/social/heichelos/${heichelId}/invites`).catch(() => null);
  const oldItems = legacy && typeof legacy === 'object' ? Object.values(legacy) : [];
  const packed = listPackedRecords({ $i, shard: 'graph' }).map(r => r.value).filter(v => v?.heichelId === heichelId && v?.status && v?.toAlias);
  return { success: [...oldItems, ...packed].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i) };
}

module.exports = { createInvite, acceptInvite, listInvites };
