// B"H
// agentRoomActions — shared agent messaging + coordination as tunnel actions.
// Lets any tunnel agent (ours, the other AI's crew, future ones) talk,
// claim files/tasks, and see who is online, through the normal action path.
//
// Payloads are plain JSON. Each action returns { ok, ... }.
// Registration: listed in agent/manifest.txt (see README for the one line).
//
// Action names:
//   agentRoomCreate   { room }                              -> { ok, room }
//   agentRoomJoin     { room, agent, desc? }                 -> { ok, room, agent }
//   agentRoomPost     { room, agent, text }                  -> { ok, seq, room }
//   agentRoomRead     { room, since?, tail? }                -> { ok, room, seq, messages[] }
//   agentRoomHeartbeat{ room, agent, status?, desc? }        -> { ok, room, agent, lastSeen }
//   agentRoomClaim    { room, agent, target, note? }         -> { ok, claimed, ... }
//   agentRoomRelease  { room, agent, target }                -> { ok, released, ... }
//   agentRoomClaims   { room }                               -> { ok, room, claims[] }
//   agentRoomCheck    { room, target }                       -> { ok, claimed, by, ts, note }
//   agentRoomStatus   { room, withinMs? }                    -> { ok, room, ..., agents[], claims[] }
//   agentRoomRooms    {}                                     -> { ok, rooms[] }
//
// State dir is OUTSIDE git:
//   /Users/awtsmoos/.awtsmoos-tunnel-recovery/state/agent-room
// override with AGENT_ROOM_STATE (tests, multi-machine setups).

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const core = require('./room.js');

function str(v, name) {
  if (typeof v !== 'string' || !v.trim()) throw new Error('missing/invalid param: ' + name);
  return v;
}
function req(p, name) { return str(p && p[name], name); }

function listRooms() {
  const dir = path.join(core.stateDir(), 'rooms');
  const rooms = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort()
    : [];
  return { ok: true, rooms };
}

function buildAgentRoomActions() {
  const wrap = fn => async payload => {
    try {
      return fn(payload || {});
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  };

  const agentRoomCreate = wrap(p => core.newRoom(req(p, 'room'), p.agent || undefined));
  const agentRoomJoin = wrap(p => core.joinRoom(req(p, 'room'), req(p, 'agent'), p.desc));
  const agentRoomPost = wrap(p => core.postMessage(req(p, 'room'), req(p, 'agent'), req(p, 'text')));
  const agentRoomRead = wrap(p => core.readMessages(req(p, 'room'), { since: p.since, tail: p.tail }));
  const agentRoomHeartbeat = wrap(p => core.heartbeat(req(p, 'room'), req(p, 'agent'), p.status, p.desc));
  const agentRoomClaim = wrap(p => core.claimTarget(req(p, 'room'), req(p, 'agent'), req(p, 'target'), p.note));
  const agentRoomRelease = wrap(p => core.releaseTarget(req(p, 'room'), req(p, 'agent'), req(p, 'target')));
  const agentRoomClaims = wrap(p => core.listClaims(req(p, 'room')));
  const agentRoomCheck = wrap(p => core.checkClaim(req(p, 'room'), req(p, 'target')));
  const agentRoomStatus = wrap(p => core.roomStatus(req(p, 'room'), p.withinMs));
  const agentRoomRooms = wrap(() => listRooms());

  return {
    agentRoomCreate, agentRoomJoin, agentRoomPost, agentRoomRead,
    agentRoomHeartbeat, agentRoomClaim, agentRoomRelease, agentRoomClaims,
    agentRoomCheck, agentRoomStatus, agentRoomRooms
  };
}

module.exports = { buildAgentRoomActions };
