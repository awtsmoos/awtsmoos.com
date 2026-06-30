// B"H
const Identity = require('../../../../lib/runtime/processIdentity.js');
const Base = require('./base.js');
const Status = require('./status.js');

/**
 * B"H — Live view is where the room teaches the tunnel how to steer.
 * It gives links, process handles, and gentle continuation cues without
 * shouting; the mission may bend, but should not stop just because a step ran.
 */
function agentProcessViews(m, s, input = {}) {
  const agents = s.agents.length ? s.agents : [{ agentId:Base.agentId(input) }];
  return agents.map(agent => viewFor(m, s, input, agent));
}
function viewFor(m, s, input, agent) {
  const identity = Identity.fromPayload({ ...input, missionId:m.id, roomId:s.roomId, logicalAgentId:agent.agentId || agent.logicalAgentId || agent.name || 'agent' });
  return { agentId:identity.logicalAgentId, processIdentity:identity, osLinks:Identity.osLinks(identity),
    actions:{ status:{ action:'asyncTaskStatus', processKey:identity.processKey }, startHeavy:{ action:'missionOsSteer', missionId:m.id, roomId:s.roomId, logicalAgentId:identity.logicalAgentId, autoAsync:true }, cancel:{ action:'asyncTaskCancel', processKey:identity.processKey } } };
}
function modulePreviewLinks(m, s, input = {}) {
  const base = input.base || 'https://awtsmoos.com';
  const qs = new URLSearchParams({ compact:'true', missionId:m.id, roomId:s.roomId });
  return { os:`${base}/os?view=mission-room&${qs}`, code:`${base}/apps/code?${qs}`, tunnelControl:`${base}/apps/tunnel-control?${qs}`, compactHint:'Use compact=true for condensed module previews.' };
}
function live(m, input = {}) {
  const s = Status.status(m), roomPath = `/api/tunnel/control/mission-room/${encodeURIComponent(s.roomId)}`;
  return { ...s, action:'missionRoomLiveStatus', live:true, osLinks:modulePreviewLinks(m, s, input),
    perAgentProcessViews:agentProcessViews(m, s, input), streamContracts:streams(roomPath), commandViews:commands(m, s, input),
    guidance:'You can steer this room toward the highest-value unfinished work. Keep the mission alive until the user gives a verified stop.',
    continuity:{ defaultBehavior:'continue_until_explicit_stop', minimum:'one_hour_or_forever', ending:'denied_without_confirmed_stop' } };
}
function streams(roomPath) { return { api:{ status:`${roomPath}/status`, events:`${roomPath}/events`, commands:`${roomPath}/commands`, timeline:`${roomPath}/timeline` }, websocket:{ room:`${roomPath}/ws`, commands:`${roomPath}/commands/ws`, dashboard:`${roomPath}/dashboard/ws` } }; }
function commands(m, s, input) { return { latest:{ action:'missionRoomLiveStatus', missionId:m.id, roomId:s.roomId }, scheduler:{ action:'missionRoomSchedulerStatus', missionId:m.id, roomId:s.roomId }, daemon:{ action:'missionDaemonTick', missionId:m.id, roomId:s.roomId, auto:true }, steer:{ action:'missionOsSteer', missionId:m.id, roomId:s.roomId, direction:input.direction || 'choose highest-value unfinished work' } }; }
module.exports = { live, agentProcessViews, modulePreviewLinks };
