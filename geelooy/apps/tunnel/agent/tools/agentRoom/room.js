// B"H
// agentRoom core: a tiny, dependency-free shared messaging + coordination store
// for agents working on the same machine (via the Awtsmoos Tunnel).
//
// State lives OUTSIDE git by default:
//   /Users/awtsmoos/.awtsmoos-tunnel-recovery/state/agent-room/
// Override with the AGENT_ROOM_STATE env var (useful for tests).
//
// Layout: state/rooms/<room>.json
//   { name, created, seq, messages[], agents{}, claims{} }
//
// Mutating operations run under a per-room mkdir-based lock so two agents
// racing a claim/post do not interleave read-modify-write.

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_STATE = '/Users/awtsmoos/.awtsmoos-tunnel-recovery/state/agent-room';
const ONLINE_WINDOW_MS = 120000; // presence: lastSeen within this = online
const LOCK_WAIT_MS = 4000;
const LOCK_POLL_MS = 25;
const ROOM_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

function stateDir() {
  return process.env.AGENT_ROOM_STATE || DEFAULT_STATE;
}
function roomsDir() {
  return path.join(stateDir(), 'rooms');
}
function roomFile(room) {
  return path.join(roomsDir(), room + '.json');
}
function roomLockDir(room) {
  return path.join(roomsDir(), '.' + room + '.lock');
}
function nowIso() {
  return new Date().toISOString();
}

function checkRoom(room) {
  if (typeof room !== 'string' || !ROOM_RE.test(room)) {
    throw new Error('invalid room name: use 1-64 chars, letters/digits/_/- (must start with letter or digit)');
  }
}
function checkAgent(agent) {
  if (typeof agent !== 'string' || !agent.trim() || agent.trim().length > 64) {
    throw new Error('agent identity required (--agent NAME, up to 64 chars)');
  }
}

// mkdir-based mutex: atomic on POSIX. Throws on timeout.
function withLock(room, fn) {
  const lock = roomLockDir(room);
  const deadline = Date.now() + LOCK_WAIT_MS;
  let acquired = false;
  while (!acquired) {
    try {
      fs.mkdirSync(lock);
      acquired = true;
    } catch (e) {
      if (e && e.code === 'EEXIST') {
        if (Date.now() > deadline) throw new Error('room locked (another agent is writing): ' + room);
        const until = Date.now() + LOCK_POLL_MS;
        while (Date.now() < until) { /* busy wait, cheap */ }
        continue;
      }
      throw e;
    }
  }
  try {
    return fn();
  } finally {
    try { fs.rmdirSync(lock); } catch (e) { /* best effort */ }
  }
}

function ensureRoomsDir() {
  fs.mkdirSync(roomsDir(), { recursive: true });
}

function readRoom(room) {
  checkRoom(room);
  const f = roomFile(room);
  if (!fs.existsSync(f)) throw new Error('no such room: ' + room + ' (create it first)');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function writeRoom(room, data) {
  const f = roomFile(room);
  const tmp = f + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1));
  fs.renameSync(tmp, f); // atomic replace
}

function newRoom(room, agent) {
  checkRoom(room);
  ensureRoomsDir();
  return withLock(room, () => {
    if (fs.existsSync(roomFile(room))) throw new Error('room already exists: ' + room);
    const data = {
      name: room,
      created: nowIso(),
      seq: 0,
      messages: [],
      agents: {},
      claims: {}
    };
    if (agent) data.agents[agent] = { lastSeen: nowIso(), status: 'active', desc: '' };
    writeRoom(room, data);
    return { ok: true, room };
  });
}

function touchAgent(data, agent, extra) {
  data.agents[agent] = Object.assign(
    { lastSeen: nowIso(), status: 'active', desc: '' },
    data.agents[agent] || {},
    { lastSeen: nowIso() },
    extra || {}
  );
}

function joinRoom(room, agent, desc) {
  checkAgent(agent);
  ensureRoomsDir();
  return withLock(room, () => {
    const data = readRoom(room);
    touchAgent(data, agent, desc !== undefined ? { desc: String(desc) } : {});
    writeRoom(room, data);
    return { ok: true, room, agent };
  });
}

function postMessage(room, agent, text) {
  checkAgent(agent);
  if (typeof text !== 'string' || !text.trim()) throw new Error('message text required');
  if (text.length > 20000) throw new Error('message too long (max 20000 chars)');
  ensureRoomsDir();
  return withLock(room, () => {
    const data = readRoom(room);
    data.seq += 1;
    const msg = { seq: data.seq, agent, ts: nowIso(), text: String(text) };
    data.messages.push(msg);
    // bound history: keep last 2000 messages
    if (data.messages.length > 2000) data.messages = data.messages.slice(-2000);
    touchAgent(data, agent, {});
    writeRoom(room, data);
    return { ok: true, seq: msg.seq, room };
  });
}

function readMessages(room, opts) {
  opts = opts || {};
  const data = readRoom(room);
  let msgs = data.messages || [];
  if (opts.since != null) {
    const s = Number(opts.since);
    msgs = msgs.filter(m => m.seq > s);
  }
  if (opts.tail != null) {
    const t = Number(opts.tail);
    msgs = msgs.slice(-t);
  }
  return { ok: true, room, seq: data.seq, messages: msgs };
}

function heartbeat(room, agent, status, desc) {
  checkAgent(agent);
  if (status && !/^(active|away|busy)$/.test(status)) throw new Error('status must be active|away|busy');
  ensureRoomsDir();
  return withLock(room, () => {
    const data = readRoom(room);
    const extra = {};
    if (status) extra.status = status;
    if (desc !== undefined) extra.desc = String(desc);
    touchAgent(data, agent, extra);
    writeRoom(room, data);
    return { ok: true, room, agent, lastSeen: data.agents[agent].lastSeen };
  });
}

// claim a file path or task name so other agents do not edit it concurrently
function claimTarget(room, agent, target, note) {
  checkAgent(agent);
  if (typeof target !== 'string' || !target.trim() || target.trim().length > 512) {
    throw new Error('claim target required (file path or task name, up to 512 chars)');
  }
  target = target.trim();
  ensureRoomsDir();
  return withLock(room, () => {
    const data = readRoom(room);
    const existing = (data.claims || {})[target];
    if (existing && existing.agent !== agent) {
      return { ok: false, claimed: false, reason: 'already claimed', by: existing.agent, ts: existing.ts, note: existing.note || '' };
    }
    data.claims[target] = { agent, ts: nowIso(), note: String(note || '') };
    touchAgent(data, agent, {});
    writeRoom(room, data);
    return { ok: true, claimed: true, room, target, agent };
  });
}

function releaseTarget(room, agent, target) {
  checkAgent(agent);
  if (typeof target !== 'string' || !target.trim()) throw new Error('claim target required');
  target = target.trim();
  ensureRoomsDir();
  return withLock(room, () => {
    const data = readRoom(room);
    const existing = (data.claims || {})[target];
    if (!existing) return { ok: false, released: false, reason: 'not claimed' };
    if (existing.agent !== agent) {
      return { ok: false, released: false, reason: 'claimed by another agent', by: existing.agent };
    }
    delete data.claims[target];
    touchAgent(data, agent, {});
    writeRoom(room, data);
    return { ok: true, released: true, room, target };
  });
}

function listClaims(room) {
  const data = readRoom(room);
  const claims = data.claims || {};
  return {
    ok: true,
    room,
    claims: Object.keys(claims).sort().map(t => Object.assign({ target: t }, claims[t]))
  };
}

function checkClaim(room, target) {
  const data = readRoom(room);
  const existing = (data.claims || {})[String(target).trim()];
  return {
    ok: true,
    room,
    target: String(target).trim(),
    claimed: !!existing,
    by: existing ? existing.agent : null,
    ts: existing ? existing.ts : null,
    note: existing ? (existing.note || '') : ''
  };
}

function presence(room, withinMs) {
  const data = readRoom(room);
  const win = withinMs != null ? Number(withinMs) : ONLINE_WINDOW_MS;
  const cutoff = Date.now() - win;
  const agents = Object.keys(data.agents || {}).sort().map(name => {
    const a = data.agents[name];
    return {
      agent: name,
      online: new Date(a.lastSeen).getTime() >= cutoff,
      lastSeen: a.lastSeen,
      status: a.status || 'active',
      desc: a.desc || ''
    };
  });
  return { ok: true, room, withinMs: win, agents };
}

function roomStatus(room, withinMs) {
  const data = readRoom(room);
  const p = presence(room, withinMs);
  const claims = listClaims(room);
  return {
    ok: true,
    room,
    created: data.created,
    messages: (data.messages || []).length,
    lastSeq: data.seq,
    agents: p.agents,
    claims: claims.claims
  };
}

module.exports = {
  stateDir, checkRoom, checkAgent,
  newRoom, joinRoom, postMessage, readMessages, heartbeat,
  claimTarget, releaseTarget, listClaims, checkClaim, presence, roomStatus,
  ONLINE_WINDOW_MS
};
