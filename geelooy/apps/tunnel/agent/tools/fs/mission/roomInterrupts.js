// B"H
function create(m, input = {}, env) {
  const room = env.RoomState.ensure(m, input);
  room.interrupts ||= [];
  const interrupt = {
    id: input.interruptId || env.RoomState.id('room_interrupt'),
    at: env.RoomState.now(),
    fromAgent: env.RoomState.text(input.fromAgent || input.agentId || 'user'),
    toAgent: env.RoomState.text(input.toAgent || input.to || 'all'),
    messageId: env.RoomState.text(input.messageId || ''),
    reason: env.RoomState.text(input.reason || 'room_message_interrupt'),
    status: 'blocking',
    suspendedWorkQuoted: quote(input.currentWork || input.suspendedWork || input.currentAction || room.currentWork || ''),
    recoveryRequiredBy: env.RoomState.text(input.recoveryRequiredBy || input.toAgent || 'any_agent')
  };
  room.interrupts.push(interrupt);
  room.currentWork = '';
  meta(env, input, m, 'room_interrupt', { agentId: interrupt.fromAgent, message: interrupt.reason, payload: { interruptId: interrupt.id, messageId: interrupt.messageId, suspendedWorkQuoted: interrupt.suspendedWorkQuoted } });
  env.event(m, 'mission_room_interrupt', interrupt.reason, { roomId: room.id, interruptId: interrupt.id, messageId: interrupt.messageId });
  return interrupt;
}
function quote(value) {
  const text = String(value || 'No current work was supplied.').trim();
  return text.split('\n').map(line => `> ${line}`).join('\n');
}
function blocking(m) {
  if (!m.room || !Array.isArray(m.room.interrupts)) return [];
  return m.room.interrupts.filter(x => x.status === 'blocking');
}
function recover(m, input = {}, env) {
  const room = env.RoomState.ensure(m, input);
  room.interrupts ||= [];
  const target = room.interrupts.find(x => x.id === input.interruptId) || blocking(m)[0];
  if (!target) return { ok: false, error: 'no_blocking_interrupt' };
  target.status = 'recovered';
  target.recoveredAt = env.RoomState.now();
  target.recoveredBy = env.RoomState.agentId(input);
  target.recoveryNote = env.RoomState.text(input.note || input.message || 'Recovered interrupt and resumed room protocol.');
  meta(env, input, m, 'room_interrupt_recovered', { agentId: target.recoveredBy, message: target.recoveryNote, payload: { interruptId: target.id } });
  env.event(m, 'mission_room_interrupt_recovered', target.recoveryNote, { roomId: room.id, interruptId: target.id, agentId: target.recoveredBy });
  return { ok: true, interrupt: target };
}
function mustCallNext(m) {
  const hit = blocking(m)[0];
  return hit ? { action: 'missionRoomRecoverInterrupt', missionId: m.id, interruptId: hit.id, agentId: hit.recoveryRequiredBy === 'any_agent' ? 'agent' : hit.recoveryRequiredBy } : null;
}
function meta(env, input, m, kind, data) {
  if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
  return env.MetadataStore.record({ root: input.__configRoot || input.projectRoot, metadataRoot: input.__metadataRoot }, m, kind, data);
}
module.exports = { create, blocking, recover, mustCallNext };
