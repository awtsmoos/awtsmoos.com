// B"H
const State = require('./state.js');
const Queue = require('./queue.js');
const Locks = require('./locks.js');
const Receipts = require('./receipts.js');
const Emergency = require('./emergency.js');
const Metrics = require('./metrics.js');
const Idle = require('./idle.js');
const Send = require('./send.js');
const Cycle = require('./cycle.js');
const Promote = require('./promote.js');
const Prompt = require('./prompt.js');

/** B"H — Chapter 1968: One tick advances the wheel without chaining the gate. */
async function run(input = {}, deps = {}) {
  const base = input.base || process.env.HOME;
  const owner = input.owner || `tick_${Date.now()}`;
  const state = State.read(base);
  const conversationId = input.conversationId || state.current || '';
  const session = state.sessions?.[conversationId] || { conversationId, goal: input.goal || input.objective || '' };
  const emergency = Emergency.check({ ...input, conversationId });
  if (emergency.stop) return finish(base, state, session, 'stopped', { emergency });
  Locks.cleanup(state);
  const lock = Locks.acquire(state, conversationId, owner, input.lockTtlMs || 30000);
  if (!lock.ok) return finish(base, state, session, 'locked', { lock: lock.lock });
  try {
    const idle = deps.readIdle ? await deps.readIdle(input) : await Idle.read(input);
    if (!idle.idle) return finish(base, state, session, 'waiting_response', { idle });
    const item = Queue.next(state, conversationId) || enqueueNext(state, session, input);
    state.queue[item.id] = Queue.transition(item, 'submitted');
    const sent = deps.send ? await deps.send({ ...input, prompt: item.prompt }) : await Send.one({ ...input, prompt: item.prompt });
    state.queue[item.id] = Queue.transition(state.queue[item.id], sent.submitted ? 'waiting_response' : 'failed', { lastError: sent.error || '' });
    if (sent.submitted) advance(state, session, input);
    return finish(base, state, session, sent.submitted ? 'submitted' : 'failed', { idle, sent });
  } finally {
    Locks.release(state, conversationId, owner);
    State.write(base, state);
  }
}
function advance(state, session, input = {}) {
  const id = session.conversationId;
  const saved = state.sessions[id] || session;
  saved.promptCount = Number(saved.promptCount || 0) + 1;
  state.sessions[id] = saved;
  if (Cycle.shouldPromote(saved.promptCount, saved.promotionEvery || input.promotionEvery || 6)) {
    Queue.add(state, Queue.create({ conversationId: id, prompt: Promote.requestPrompt({ ...input, ...saved }) }));
  } else enqueueNext(state, saved, input);
}
function enqueueNext(state, session, input = {}) {
  const phase = Cycle.current(session.promptCount || 0);
  const packet = { conversationId: session.conversationId, objective: session.goal || input.goal || input.objective, nextAction: { action: 'chatgptHourLoopTick', conversationId: session.conversationId }, evidence: [`cycle:${phase}`], emergencyExit: ['user_stop','not_authenticated','unexpected_navigation'] };
  const item = Queue.create({ conversationId: session.conversationId, prompt: Cycle.instruction(phase, packet) + '\n\n' + Prompt.build(packet) });
  Queue.add(state, item);
  return item;
}
function finish(base, state, session, phase, extra = {}) {
  const conversationId = session.conversationId || state.current || '';
  const metric = Metrics.sample({ phase, conversationId, idle: extra.idle?.idle, sent: extra.sent?.submitted, failure: extra.sent?.error || '' });
  const receipt = Receipts.create({ conversationId, phase, ok: phase !== 'failed', metric, evidence: [phase], error: metric.failure });
  Receipts.add(state, receipt);
  State.write(base, state);
  return { ok: phase !== 'failed', action: 'chatgptHourLoopTick', phase, conversationId, promptCount: state.sessions?.[conversationId]?.promptCount || 0, receipt, nextAction: { action: 'chatgptHourLoopTick', conversationId }, ...extra };
}
module.exports = { run, finish, advance, enqueueNext };
