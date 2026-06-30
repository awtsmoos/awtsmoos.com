// B"H
const crypto = require('crypto');

/**
 * B"H
 * Chapter 1907: Every agent received a name, a room, and a process shadow.
 *
 * Correlation bugs feed on anonymous work. This identity stamp follows each
 * auto-offloaded child so receipts, rooms, agents, and OS dashboards can agree
 * which soul moved which stone.
 */
function clean(value, fallback = '') {
  const text = String(value || fallback || '').trim().replace(/[^a-zA-Z0-9_.:-]/g, '_');
  return text || fallback || '';
}
function shortHash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12);
}
function fromPayload(payload = {}, fallback = {}) {
  const missionId = clean(payload.missionId || fallback.missionId || 'no_mission');
  const roomId = clean(payload.roomId || payload.missionRoomId || fallback.roomId || missionId);
  const logicalAgentId = clean(payload.logicalAgentId || payload.agentId || payload.agentName || fallback.logicalAgentId || 'agent');
  const agentSessionId = clean(payload.agentSessionId || fallback.agentSessionId || `session_${shortHash(`${missionId}:${roomId}:${logicalAgentId}`)}`);
  const processKey = clean(`${missionId}__${roomId}__${logicalAgentId}__${agentSessionId}`);
  return { missionId, roomId, logicalAgentId, agentSessionId, processKey, processGroup:`room:${roomId}`, processLabel:`${roomId}/${logicalAgentId}` };
}
function env(identity = {}) {
  return {
    AWTSMOOS_MISSION_ID: identity.missionId || '',
    AWTSMOOS_ROOM_ID: identity.roomId || '',
    AWTSMOOS_LOGICAL_AGENT_ID: identity.logicalAgentId || '',
    AWTSMOOS_AGENT_SESSION_ID: identity.agentSessionId || '',
    AWTSMOOS_PROCESS_KEY: identity.processKey || '',
    AWTSMOOS_PROCESS_GROUP: identity.processGroup || ''
  };
}
function osLinks(identity = {}, input = {}) {
  const compact = input.compact === false ? 'false' : 'true';
  const base = input.base || 'https://awtsmoos.com';
  const qs = new URLSearchParams({ compact, missionId:identity.missionId || '', roomId:identity.roomId || '', agentId:identity.logicalAgentId || '' });
  return {
    os:`${base}/os?${qs.toString()}`,
    code:`${base}/apps/code?${qs.toString()}`,
    tunnelControl:`${base}/apps/tunnel-control?${qs.toString()}`,
    room:`${base}/os?view=mission-room&${qs.toString()}`,
    agent:`${base}/os?view=agent-process&${qs.toString()}`
  };
}
module.exports = { clean, env, fromPayload, osLinks, shortHash };
