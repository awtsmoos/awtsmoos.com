// B"H
const Base = require('./base.js');
const Runtime = require('../roomRuntime.js');

/**
 * B"H — Status is a steering map, not an ending certificate.
 * Every response shows what exists, what blocks, and what the scheduler thinks
 * should happen next, so the agent can continue with evidence.
 */
function status(m) {
  const room = Base.ensure(m), blockingInterrupts = room.interrupts.filter(x => x.status === 'blocking');
  const scheduler = Runtime.scheduler(room);
  return {
    roomId: room.id, missionId: m.id, name: room.name, projectRoot: room.projectRoot,
    agents: Object.values(room.agents), messages: room.messages.slice(-50), invites: room.invites.slice(-20),
    discoveries: room.discoveries.slice(-20), splitProposals: room.splitProposals.slice(-20), agreements: room.agreements.slice(-50),
    claims: room.claims.slice(-50), heartbeats: room.heartbeats.slice(-50), subMissions: room.subMissions,
    mergeReports: room.mergeReports.slice(-10), interrupts: room.interrupts.slice(-20), blockingInterrupts,
    brainstorms: room.brainstorms.slice(-10), currentWork: room.currentWork,
    scheduler, missionGraph: scheduler.missionGraph, health: scheduler.health,
    nextHighestWork: scheduler.health.nextHighestWork, mustCallNext: recoverNext(m, blockingInterrupts[0]),
    counts: counts(room, blockingInterrupts)
  };
}
function recoverNext(m, interrupt) {
  if (!interrupt) return null;
  return { action:'missionRoomRecoverInterrupt', missionId:m.id, interruptId:interrupt.id, agentId:interrupt.recoveryRequiredBy === 'any_agent' ? 'agent' : interrupt.recoveryRequiredBy };
}
function counts(room, blockingInterrupts) {
  return { agents:Object.keys(room.agents).length, messages:room.messages.length,
    openSplits:room.splitProposals.filter(x => x.status !== 'accepted' && x.status !== 'rejected').length,
    subMissions:room.subMissions.length, activeClaims:room.claims.filter(x => x.status === 'active').length,
    blockingInterrupts:blockingInterrupts.length };
}
module.exports = { status };
