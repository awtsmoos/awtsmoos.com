// B"H
const Identity = require('../../../../lib/runtime/processIdentity.js');

/**
 * B"H — The room gives each worker a stable candle-name.
 * Identity is not the work itself; it is the thread that lets receipts,
 * dashboards, leases, and claims know which agent carried which spark.
 */
function cleanAgent(input = {}) {
  return String(input.agentId || input.logicalAgentId || input.agent || input.name || 'agent')
    .trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'agent';
}
function roomId(room, input = {}) {
  return input.roomId || input.missionRoomId || room.id || room.missionId || 'room';
}
function forAgent(room, input = {}, fallbackAgent = '') {
  return Identity.fromPayload({
    ...input,
    missionId: room.missionId,
    roomId: roomId(room, input),
    logicalAgentId: fallbackAgent || cleanAgent(input)
  });
}
module.exports = { cleanAgent, forAgent, roomId };
