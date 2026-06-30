// B"H
const Runtime = require('./roomRuntime.js');
function join(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const agentId = env.RoomState.agentId(input);
  const runtime = Runtime.ensureAgentRuntime(room, input, agentId);
  const agent = {
    agentId, logicalAgentId: runtime.logicalAgentId, agentSessionId: runtime.agentSessionId,
    processKey: runtime.processKey, name: env.RoomState.text(input.agentName || input.name || agentId),
    role: env.RoomState.text(input.role || 'collaborator'), capabilities: env.RoomState.list(input.capabilities || input.skills),
    status: 'active', joinedAt: room.agents[agentId]?.joinedAt || env.RoomState.now(),
    lastSeenAt: env.RoomState.now(), lease: runtime.lease, currentClaim: runtime.currentClaim,
    queues: Runtime.emptyQueues(), subMissionIds: []
  };
  room.agents[agentId] = agent;
  env.event(m, 'mission_room_agent_joined', `${agent.name} joined room`, { roomId: room.id, agentId, processKey: agent.processKey });
  return agent;
}
function invite(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const invite = { id: env.RoomState.id('room_invite'), at: env.RoomState.now(), toAgent: env.RoomState.text(input.toAgent || input.to || 'agent'), role: env.RoomState.text(input.role || 'collaborator'), capabilities: env.RoomState.list(input.capabilities), message: env.RoomState.text(input.message || `Join room ${room.id} for mission ${m.id}`), status: 'open' };
  room.invites.push(invite);
  env.event(m, 'mission_room_invite', invite.toAgent, { roomId: room.id, inviteId: invite.id });
  return invite;
}
function discover(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const suggested = [
    { agentId: 'architect', role: 'Architecture splitter', capabilities: ['file map','interfaces','risk'] },
    { agentId: 'tester', role: 'Verification keeper', capabilities: ['tests','simulation','regression'] },
    { agentId: 'implementer', role: 'Implementation worker', capabilities: ['code','refactor','proof'] },
    { agentId: 'scheduler', role: 'Continuation scheduler', capabilities: ['leases','queues','highest-value-work'] }
  ];
  const discovery = { id: env.RoomState.id('room_discovery'), at: env.RoomState.now(), projectRoot: room.projectRoot, suggestedAgents: suggested, note: env.RoomState.text(input.note || 'Scheduler-backed agent split discovered') };
  room.discoveries.push(discovery);
  env.event(m, 'mission_room_discover_agents', discovery.note, { roomId: room.id, discoveryId: discovery.id });
  return discovery;
}
module.exports = { join, invite, discover };
