// B"H
function id(prefix = 'room') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
}
function now() { return new Date().toISOString(); }
function text(v, fallback = '') { return String(v || fallback || '').trim(); }
function list(v) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) return v.split(/\n|,/).map(x => x.trim()).filter(Boolean);
  return [];
}
function agentId(input = {}) {
  return text(input.agentId || input.logicalAgentId || input.agent || input.name || 'agent').replace(/[^a-zA-Z0-9_-]/g, '_') || 'agent';
}
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
  return m.room;
}
function status(m) {
  const room = ensure(m);
  const blockingInterrupts = room.interrupts.filter(x => x.status === 'blocking');
  return {
    roomId: room.id, missionId: m.id, name: room.name, projectRoot: room.projectRoot,
    agents: Object.values(room.agents), messages: room.messages.slice(-50), invites: room.invites.slice(-20),
    discoveries: room.discoveries.slice(-20), splitProposals: room.splitProposals.slice(-20),
    agreements: room.agreements.slice(-50), claims: room.claims.slice(-50), heartbeats: room.heartbeats.slice(-50),
    subMissions: room.subMissions, mergeReports: room.mergeReports.slice(-10), interrupts: room.interrupts.slice(-20),
    blockingInterrupts, brainstorms: room.brainstorms.slice(-10), currentWork: room.currentWork,
    mustCallNext: blockingInterrupts[0] ? { action: 'missionRoomRecoverInterrupt', missionId: m.id, interruptId: blockingInterrupts[0].id, agentId: blockingInterrupts[0].recoveryRequiredBy === 'any_agent' ? 'agent' : blockingInterrupts[0].recoveryRequiredBy } : null,
    counts: {
      agents: Object.keys(room.agents).length,
      messages: room.messages.length,
      openSplits: room.splitProposals.filter(x => x.status !== 'accepted' && x.status !== 'rejected').length,
      subMissions: room.subMissions.length,
      activeClaims: room.claims.filter(x => x.status === 'active').length,
      blockingInterrupts: blockingInterrupts.length
    }
  };
}
module.exports = { id, now, text, list, agentId, ensure, status };
