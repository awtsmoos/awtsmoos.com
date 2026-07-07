// B"H
const State = require('./state.js');
const Queue = require('./queue.js');
const Locks = require('./locks.js');
const Receipts = require('./receipts.js');
const Emergency = require('./emergency.js');
const Metrics = require('./metrics.js');
const Idle = require('./idle.js');
const Send = require('./send.js');

/** B"H — Chapter 1952: One tick, one proof, one next doorway. */
async function run(input = {}, deps = {}) {
  const base = input.base || process.env.HOME;
  const owner = input.owner || `tick_${Date.now()}`;
  const state = State.read(base);
  const conversationId = input.conversationId || state.current || '';
  const emergency = Emergency.check({ ...input, conversationId });
  if (emergency.stop) return finish(base, state, conversationId, 'stopped', { emergency });
  Locks.cleanup(state);
  const lock = Locks.acquire(state, conversationId, owner, input.lockTtlMs || 30000);
  if (!lock.ok) return finish(base, state, conversationId, 'locked', { lock: lock.lock });
  try {
    const idle = deps.readIdle ? await deps.readIdle(input) : await Idle.read(input);
    if (!idle.idle) return finish(base, state, conversationId, 'waiting_response', { idle });
    const item = Queue.next(state, conversationId) || null;
    if (!item) return finish(base, state, conversationId, 'idle_no_prompt', { idle });
    state.queue[item.id] = Queue.transition(item, 'submitted');
    const sent = deps.send ? await deps.send({ ...input, prompt: item.prompt }) : await Send.one({ ...input, prompt: item.prompt });
    state.queue[item.id] = Queue.transition(state.queue[item.id], sent.submitted ? 'waiting_response' : 'failed', { lastError: sent.error || '' });
    return finish(base, state, conversationId, sent.submitted ? 'submitted' : 'failed', { idle, sent });
  } finally {
    Locks.release(state, conversationId, owner);
    State.write(base, state);
  }
}

function finish(base, state, conversationId, phase, extra = {}) {
  const metric = Metrics.sample({ phase, conversationId, idle: extra.idle?.idle, sent: extra.sent?.submitted, failure: extra.sent?.error || '' });
  const receipt = Receipts.create({ conversationId, phase, ok: phase !== 'failed', metric, evidence: [phase], error: metric.failure });
  Receipts.add(state, receipt);
  State.write(base, state);
  return { ok: phase !== 'failed', action: 'chatgptHourLoopTick', phase, conversationId, receipt, nextAction: { action: 'chatgptHourLoopTick', conversationId }, ...extra };
}
module.exports = { run, finish };
