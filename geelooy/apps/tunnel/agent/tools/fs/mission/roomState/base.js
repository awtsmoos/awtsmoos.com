// B"H
const Runtime = require('../roomRuntime.js');
function id(prefix = 'room') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`; }
function now() { return new Date().toISOString(); }
function text(v, fallback = '') { return String(v || fallback || '').trim(); }
function list(v) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) return v.split(/\n|,/).map(x => x.trim()).filter(Boolean);
  return [];
}
function agentId(input = {}) { return text(input.agentId || input.logicalAgentId || input.agent || input.name || 'agent').replace(/[^a-zA-Z0-9_-]/g, '_') || 'agent'; }

/**
 * B"H — Room shape is the calm floor under the mission storm.
 * It preserves the old fields, then lets Runtime add scheduler breath without
 * making status readers guess whether the room is alive.
 */
function ensure(m, input = {}) {
  m.room ||= {
    id: input.roomId || id('room'), missionId: m.id,
    name: text(input.name || input.roomName || m.goal || 'Mission Room'),
    projectRoot: text(input.projectRoot || input.root || m.metadata?.projectRoot || ''),
    createdAt: now(), updatedAt: now(), agents: {}, messages: [], invites: [],
    discoveries: [], splitProposals: [], agreements: [], claims: [], heartbeats: [],
    subMissions: [], mergeReports: [], interrupts: [], brainstorms: [], currentWork: ''
  };
  for (const key of ['messages','invites','discoveries','splitProposals','agreements','claims','heartbeats','subMissions','mergeReports','interrupts','brainstorms']) m.room[key] ||= [];
  m.room.agents ||= {};
  m.room.updatedAt = now();
  Runtime.ensure(m.room, input);
  return m.room;
}
module.exports = { id, now, text, list, agentId, ensure };
