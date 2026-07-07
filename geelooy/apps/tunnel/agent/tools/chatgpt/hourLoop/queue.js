// B"H
const crypto = require('crypto');
const STATES = ['queued','waiting_idle','submitted','waiting_response','completed','failed','stopped'];

/** B"H — Chapter 1947: Every prompt stands in line without blocking breath. */
function create(input = {}) {
  return { id: input.id || `hq_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`, conversationId: input.conversationId || '', prompt: String(input.prompt || ''), state: 'queued', attempts: 0, createdAt: now(), updatedAt: now(), lastError: '' };
}
function add(state, item) { state.queue[item.id] = item; return item; }
function transition(item, next, extra = {}) {
  if (!STATES.includes(next)) throw new Error(`invalid_queue_state:${next}`);
  return { ...item, ...extra, state: next, updatedAt: now() };
}
function pending(state, conversationId = '') {
  return Object.values(state.queue || {}).filter(x => !['completed','failed','stopped'].includes(x.state) && (!conversationId || x.conversationId === conversationId));
}
function next(state, conversationId = '') { return pending(state, conversationId).sort((a,b) => String(a.createdAt).localeCompare(String(b.createdAt)))[0] || null; }
function now() { return new Date().toISOString(); }
module.exports = { STATES, create, add, transition, pending, next };
