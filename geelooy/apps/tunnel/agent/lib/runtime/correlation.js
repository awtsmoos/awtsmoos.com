// B"H
const crypto = require('crypto');

/**
 * B"H
 * Chapter 1190: No response shall wander nameless between agents.
 *
 * When the caller forgets a correlation thread, the tunnel still stamps a local
 * one onto the envelope. This does not invent a conversation, but it prevents a
 * blank response from looking eligible for every waiting agent in the hall.
 */
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }
function pick(payload, keys) { for (const key of keys) if (payload[key]) return payload[key]; return ''; }
function fields(payload = {}) {
  return {
    tunnelName: payload.tunnelName || '',
    requestedTunnelName: payload.requestedTunnelName || '',
    controlRequestId: pick(payload, ['controlRequestId', 'requestId', 'id']) || id('ctrl'),
    clientRequestId: pick(payload, ['clientRequestId', 'requestId']) || id('client'),
    agentSessionId: payload.agentSessionId || '',
    logicalAgentId: payload.logicalAgentId || '',
    conversationId: payload.conversationId || '',
    conversationName: payload.conversationName || '',
    missionId: payload.missionId || '',
    projectRoot: payload.projectRoot || payload.root || '',
    nonce: payload.nonce || id('nonce')
  };
}
module.exports = { fields };
