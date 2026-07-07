// B"H
const State = require('./state.js');
const Queue = require('./queue.js');
const Receipts = require('./receipts.js');

/** B"H — Chapter 1954: The menu sees a small living map. */
function get(input = {}) {
  const state = State.read(input.base || process.env.HOME);
  const conversationId = input.conversationId || state.current || '';
  return { ok: true, action: 'chatgptHourLoopStatus', current: state.current || '', conversationId, sessions: Object.keys(state.sessions || {}).length, queued: Queue.pending(state, conversationId).length, locks: Object.keys(state.locks || {}).length, recent: Receipts.recent(state, conversationId, 5), nextAction: { action: 'chatgptHourLoopTick', conversationId } };
}
module.exports = { get };
