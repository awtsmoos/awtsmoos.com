// B"H
const Url = require('./url.js');
const State = require('./state.js');
const Queue = require('./queue.js');
const Prompt = require('./prompt.js');
const Tick = require('./tick.js');
const Daemon = require('./daemon.js');
const Status = require('./status.js');
const Menu = require('./menu.js');
const Custom = require('./customGpt.js');
const Cycle = require('./cycle.js');
const Promote = require('./promote.js');

/** B"H — Chapter 1965: Public doors now remember the cycle. */
function build(payload = {}) {
  return {
    async chatgptHourLoopStart() { return start(payload); },
    async chatgptHourLoopTick() { return Tick.run(payload); },
    async chatgptHourLoopStatus() { return Status.get(payload); },
    async chatgptHourLoopMenu() { return Menu.get(payload); },
    async chatgptHourLoopStop() { return stop(payload); },
    async chatgptHourLoopStress() { return stress(payload); },
    async chatgptHourLoopPromote() { return promote(payload); }
  };
}
function start(input = {}) {
  const urlInfo = Url.normalize(input);
  const custom = Custom.parse(input.url || input.conversationUrl || input.chatgptUrl || '');
  const info = urlInfo || { conversationId: custom.conversationId, url: Custom.conversationUrl(custom), provider: 'chatgpt' };
  if (!info.conversationId && !custom.gptId) return { ok: false, action: 'chatgptHourLoopStart', error: 'missing_chatgpt_url' };
  const state = State.read(input.base || process.env.HOME);
  const id = info.conversationId || `custom_${Date.now().toString(36)}`;
  state.current = id;
  state.sessions[id] = { ...info, ...custom, conversationId: id, status: 'active', goal: input.goal || input.objective || '', promptCount: 0, promotionEvery: Number(input.promotionEvery || 6), startedAt: new Date().toISOString() };
  enqueueCycle(state, state.sessions[id], input);
  State.write(input.base || process.env.HOME, state);
  return { ok: true, action: 'chatgptHourLoopStart', session: state.sessions[id], nextAction: { action: 'chatgptHourLoopTick', conversationId: id } };
}
function enqueueCycle(state, session, input = {}) {
  const phase = Cycle.current(session.promptCount || 0);
  const packet = { conversationId: session.conversationId, missionId: input.missionId, objective: session.goal || input.goal || input.objective, nextAction: { action: 'chatgptHourLoopTick', conversationId: session.conversationId }, emergencyExit: ['user_stop','not_authenticated','unexpected_navigation'], evidence: [`cycle:${phase}`] };
  Queue.add(state, Queue.create({ conversationId: session.conversationId, prompt: Cycle.instruction(phase, packet) + '\n\n' + Prompt.build(packet) }));
}
function stop(input = {}) { return Daemon.stop(input.conversationId || input.sessionId || 'default'); }
function stress(input = {}) { return { ok: true, action: 'chatgptHourLoopStress', status: Status.get(input), note: 'Use repeated start/status/tick probes; no long gateway wait.' }; }
function promote(input = {}) { return { ok: true, action: 'chatgptHourLoopPromote', promotion: Promote.prepare(input) }; }
module.exports = { build, start, stop, stress, promote, enqueueCycle };
