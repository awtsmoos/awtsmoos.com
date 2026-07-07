// B"H
const crypto = require('crypto');

/** B"H — Chapter 1949: A receipt is the footprint between ticks. */
function create(input = {}) {
  return { id: input.id || `hr_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`, at: new Date().toISOString(), conversationId: input.conversationId || '', phase: input.phase || 'tick', ok: input.ok !== false, evidence: input.evidence || [], metric: input.metric || null, nextAction: input.nextAction || null, error: input.error || '' };
}
function add(state, receipt, max = 200) {
  state.receipts = [...(state.receipts || []), receipt].slice(-max);
  return receipt;
}
function recent(state, conversationId = '', limit = 10) {
  return (state.receipts || []).filter(r => !conversationId || r.conversationId === conversationId).slice(-limit);
}
module.exports = { create, add, recent };
