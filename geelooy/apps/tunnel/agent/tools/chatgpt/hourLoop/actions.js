// B"H
const Url = require('./url.js');
const State = require('./state.js');
const Queue = require('./queue.js');
const Prompt = require('./prompt.js');
const Tick = require('./tick.js');
const Daemon = require('./daemon.js');
const Status = require('./status.js');
const Menu = require('./menu.js');

/** B"H — Chapter 1956: Public doors for the hour loop. */
function build(payload = {}) {
  return {
    async chatgptHourLoopStart() { return start(payload); },
    async chatgptHourLoopTick() { return Tick.run(payload); },
    async chatgptHourLoopStatus() { return Status.get(payload); },
    async chatgptHourLoopMenu() { return Menu.get(payload); },
    async chatgptHourLoopStop() { return stop(payload); },
    async chatgptHourLoopStress() { return stress(payload); }
  };
}
function start(input = {}) {
  const info = Url.normalize(input);
  if (!info) return { ok: false, action: 'chatgptHourLoopStart', error: 'missing_chatgpt_url' };
  const state = State.read(input.base || process.env.HOME);
  state.current = info.conversationId;
  state.sessions[info.conversationId] = { ...info, status: 'active', startedAt: new Date().toISOString() };
  const packet = { conversationId: info.conversationId, missionId: input.missionId, objective: input.goal || input.objective, nextAction: { action: 'chatgptHourLoopTick', conversationId: info.conversationId }, emergencyExit: ['user_stop','not_authenticated','unexpected_navigation'] };
  Queue.add(state, Queue.create({ conversationId: info.conversationId, prompt: Prompt.build(packet) }));
  State.write(input.base || process.env.HOME, state);
  return { ok: true, action: 'chatgptHourLoopStart', session: info, nextAction: { action: 'chatgptHourLoopTick', conversationId: info.conversationId } };
}
function stop(input = {}) { return Daemon.stop(input.conversationId || input.sessionId || 'default'); }
function stress(input = {}) { return { ok: true, action: 'chatgptHourLoopStress', status: Status.get(input), note: 'Use repeated status/tick probes for long stress.' }; }
module.exports = { build, start, stop, stress };
