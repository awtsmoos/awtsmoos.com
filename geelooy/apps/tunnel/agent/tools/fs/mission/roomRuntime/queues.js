// B"H
const Identity = require('./identity.js');
const QUEUES = ['futureQueue','dependencyQueue','blockedQueue','researchQueue','reviewQueue','verificationQueue','watchQueue'];

/**
 * B"H — Seven quiet shelves for unfinished light.
 * A mission does not end when a shelf is empty; it simply asks which shelf or
 * discovery path should receive the next honest piece of work.
 */
function emptyQueues() { return Object.fromEntries(QUEUES.map(key => [key, []])); }
function ensureAgentRuntime(room, input = {}, targetAgentId = '') {
  room.agentRuntime ||= {};
  const logicalAgentId = targetAgentId || Identity.cleanAgent(input);
  const identity = Identity.forAgent(room, input, logicalAgentId);
  const current = room.agentRuntime[logicalAgentId] || {};
  room.agentRuntime[logicalAgentId] = {
    ...emptyQueues(), ...current,
    missionId: identity.missionId, roomId: identity.roomId,
    logicalAgentId: identity.logicalAgentId, agentSessionId: identity.agentSessionId,
    processKey: identity.processKey,
    lease: current.lease || { status: 'active', renewedAt: new Date().toISOString() },
    heartbeat: new Date().toISOString(), currentClaim: current.currentClaim || null
  };
  return room.agentRuntime[logicalAgentId];
}
function ensure(room, input = {}) {
  room.scheduler ||= { mode: 'living_room_scheduler', stopRule: 'verified_user_stop_only' };
  for (const key of ['claims','interrupts','subMissions']) room[key] ||= [];
  const ids = new Set(Object.keys(room.agents || {}));
  ids.add(Identity.cleanAgent(input));
  for (const id of ids) ensureAgentRuntime(room, input, id);
  return room;
}
module.exports = { QUEUES, emptyQueues, ensure, ensureAgentRuntime };
