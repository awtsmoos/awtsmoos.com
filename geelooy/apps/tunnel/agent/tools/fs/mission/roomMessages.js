// B"H
function add(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const from = input.fromAgent || env.RoomState.agentId(input);
  const msg = { id: input.messageId || env.RoomState.id('room_msg'), at: env.RoomState.now(), fromAgent: from, toAgent: env.RoomState.text(input.toAgent || input.to || 'all'), kind: env.RoomState.text(input.kind || 'chat'), subject: env.RoomState.text(input.subject || input.title), body: env.RoomState.text(input.body || input.message || input.text), references: env.RoomState.list(input.references || input.files || input.paths), interrupts: input.interrupt !== false && input.interrupt !== 'false' };
  room.messages.push(msg);
  meta(env, input, m, 'room_message', { agentId: from, subject: msg.subject, message: msg.body, payload: { messageId: msg.id, toAgent: msg.toAgent, kind: msg.kind } });
  let interrupt = null;
  if (msg.interrupts) interrupt = env.RoomInterrupts.create(m, { ...input, fromAgent: from, messageId: msg.id, currentWork: input.currentWork || room.currentWork, reason: input.kind === 'user' ? 'user_message_interrupt' : 'agent_message_interrupt' }, env);
  env.event(m, 'mission_room_message', msg.subject || msg.body.slice(0, 120), { roomId: room.id, messageId: msg.id, fromAgent: from, interrupts: msg.interrupts });
  return { message: msg, interrupt };
}
function heartbeat(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const agentId = env.RoomState.agentId(input);
  const beat = { id: env.RoomState.id('room_beat'), at: env.RoomState.now(), agentId, status: env.RoomState.text(input.status || 'active'), currentMissionId: env.RoomState.text(input.currentMissionId || input.subMissionId), note: env.RoomState.text(input.note || input.message) };
  room.heartbeats.push(beat);
  if (input.currentWork || input.currentAction) room.currentWork = env.RoomState.text(input.currentWork || input.currentAction);
  if (room.agents[agentId]) room.agents[agentId].lastSeenAt = beat.at;
  meta(env, input, m, 'room_heartbeat', { agentId, message: beat.note, payload: { heartbeatId: beat.id, status: beat.status, currentMissionId: beat.currentMissionId } });
  env.event(m, 'mission_room_heartbeat', `${agentId}: ${beat.status}`, { roomId: room.id, agentId });
  return beat;
}
function brainstorm(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const agentId = env.RoomState.agentId(input);
  const ideas = Array.from({ length: Math.max(10, Number(input.count || 25)) }, (_, index) => `${index + 1}. ${agentId} room idea: ${topic(index)} for ${room.name}`);
  const record = { id: env.RoomState.id('room_brainstorm'), at: env.RoomState.now(), agentId, prompt: env.RoomState.text(input.prompt || 'Brainstorm room coordination before acting'), ideas };
  room.brainstorms.push(record);
  meta(env, input, m, 'room_brainstorm', { agentId, message: record.prompt, payload: { brainstormId: record.id, ideaCount: ideas.length } });
  env.event(m, 'mission_room_brainstorm', record.prompt, { roomId: room.id, brainstormId: record.id, agentId });
  return record;
}
function meta(env, input, m, kind, data) {
  if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
  return env.MetadataStore.record({ root: input.__configRoot || input.projectRoot, metadataRoot: input.__metadataRoot }, m, kind, data);
}
function topic(index) {
  return ['find active room','join correct mission','send interrupt-aware message','quote suspended work','recover blocking interrupt','split workload','create sub-mission','merge reports'][index % 8];
}
module.exports = { add, heartbeat, brainstorm };
