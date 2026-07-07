// B"H
const State = require('./state.js');
const Queue = require('./queue.js');
const Receipts = require('./receipts.js');
const Cycle = require('./cycle.js');

/** B"H — Chapter 1966: Status shows the next spark. */
function get(input = {}) {
  const state = State.read(input.base || process.env.HOME);
  const conversationId = input.conversationId || state.current || '';
  const session = state.sessions?.[conversationId] || {};
  const count = Number(session.promptCount || 0);
  return { ok: true, action: 'chatgptHourLoopStatus', current: state.current || '', conversationId, phase: Cycle.current(count), promptCount: count, promotionDue: Cycle.shouldPromote(count, session.promotionEvery || 6), sessions: Object.keys(state.sessions || {}).length, queued: Queue.pending(state, conversationId).length, locks: Object.keys(state.locks || {}).length, recent: Receipts.recent(state, conversationId, 5), nextAction: { action: 'chatgptHourLoopTick', conversationId } };
}
module.exports = { get };
