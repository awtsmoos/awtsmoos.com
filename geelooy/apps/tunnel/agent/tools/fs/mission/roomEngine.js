// B"H
function createRoomEngine(env) {
  function reg(config, m, input = {}) { return env.MetadataStore?.upsertRoom(config || { root: input.__configRoot || input.projectRoot, metadataRoot: input.__metadataRoot }, m, input); }
  function roomCreate(m, input = {}) { const room = env.RoomState.ensure(m, input); env.event(m, 'mission_room_created', room.name, { roomId: room.id }); reg(null, m, input); return room; }
  function roomJoin(m, input = {}) { const out = env.RoomAgents.join(m, input, env); reg(null, m, input); return out; }
  function roomStatus(m) { return env.RoomState.status(m); }
  function roomMessage(m, input = {}) { const out = env.RoomMessages.add(m, input, env); reg(null, m, input); return out; }
  function roomUserMessage(m, input = {}) { const out = env.RoomMessages.add(m, { ...input, agentId: 'user', fromAgent: 'user', kind: 'user', interrupt: input.interrupt ?? true }, env); reg(null, m, input); return out; }
  function roomBrainstorm(m, input = {}) { const out = env.RoomMessages.brainstorm(m, input, env); reg(null, m, input); return out; }
  function roomRecoverInterrupt(m, input = {}) { const out = env.RoomInterrupts.recover(m, input, env); reg(null, m, input); return out; }
  function roomBlockingInterrupts(m) { return env.RoomInterrupts.blocking(m, env); }
  function roomDiscoverAgents(m, input = {}) { const out = env.RoomAgents.discover(m, input, env); reg(null, m, input); return out; }
  function roomInviteAgent(m, input = {}) { const out = env.RoomAgents.invite(m, input, env); reg(null, m, input); return out; }
  function roomProposeSplit(m, input = {}) { const out = env.RoomDelegation.proposeSplit(m, input, env); reg(null, m, input); return out; }
  function roomAcceptSplit(m, input = {}) { const out = env.RoomDelegation.acceptSplit(m, input, env); reg(null, m, input); return out; }
  async function roomCreateSubMissions(config, m, input = {}) { const out = await env.RoomSubMissions.createSubMissions(config, m, input, env); reg(config, m, input); return out; }
  function roomClaimTask(m, input = {}) { const out = env.RoomDelegation.claimTask(m, input, env); reg(null, m, input); return out; }
  function roomHeartbeat(m, input = {}) { const out = env.RoomMessages.heartbeat(m, input, env); reg(null, m, input); return out; }
  function roomMergeReports(m, input = {}) { const out = env.RoomSubMissions.mergeReports(m, input, env); reg(null, m, input); return out; }
  function roomAgreementStatus(m) { return env.RoomAgreement.status(m, env); }
  async function roomFindActive(config, input = {}) { return env.RoomDiscovery.around(await env.all(config), input, env, env.MetadataStore?.activeRooms(config, input)); }
  async function roomSimulate(config, m, input = {}) { const out = await env.RoomSimulator.simulate(config, m, input, env); reg(config, m, input); return out; }
  async function roomRealChatSimulate(config, m, input = {}) { const out = await env.RoomSimulator.realChatSimulate(config, m, input, env); reg(config, m, input); return out; }
  function roomInbox(m, input = {}) { return env.roomLoop.inbox(m, input); }
  async function roomWakeAgent(config, m, input = {}) { const out = await env.roomLoop.wakeAgent(config, m, input); reg(config, m, input); return out; }
  function roomLoopPulse(m, input = {}) { const out = env.roomLoop.loopPulse(m, input); reg(null, m, input); return out; }
  function roomWatchdog(m, input = {}) { return env.roomLoop.watchdog(m, input); }
  function roomRecoverStaleAgent(m, input = {}) { const out = env.roomLoop.recoverStaleAgent(m, input); reg(null, m, input); return out; }
  function roomClaimFile(m, input = {}) { const out = env.roomLoop.claimFile(m, input); reg(null, m, input); return out; }
  function roomReleaseFile(m, input = {}) { const out = env.roomLoop.releaseFile(m, input); reg(null, m, input); return out; }
  function roomFileConflicts(m, input = {}) { return env.roomLoop.fileConflicts(m, input); }
  function roomMergeCourt(m, input = {}) { const out = env.roomLoop.mergeCourt(m, input); reg(null, m, input); return out; }
  return { roomCreate, roomJoin, roomStatus, roomMessage, roomUserMessage, roomBrainstorm, roomRecoverInterrupt, roomBlockingInterrupts, roomDiscoverAgents, roomInviteAgent, roomProposeSplit, roomAcceptSplit, roomCreateSubMissions, roomClaimTask, roomHeartbeat, roomMergeReports, roomAgreementStatus, roomFindActive, roomSimulate, roomRealChatSimulate, roomInbox, roomWakeAgent, roomLoopPulse, roomWatchdog, roomRecoverStaleAgent, roomClaimFile, roomReleaseFile, roomFileConflicts, roomMergeCourt };
}
module.exports = { createRoomEngine };
