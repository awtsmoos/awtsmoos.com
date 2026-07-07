// B"H

/** B"H — Chapter 1948: One conversation, one hand on the quill. */
function acquire(state, conversationId, owner, ttlMs = 30000) {
  const now = Date.now();
  const existing = state.locks[conversationId];
  if (existing && existing.until > now && existing.owner !== owner) return { ok: false, lock: existing };
  const lock = { conversationId, owner, at: now, until: now + ttlMs };
  state.locks[conversationId] = lock;
  return { ok: true, lock };
}
function release(state, conversationId, owner) {
  const lock = state.locks[conversationId];
  if (!lock || lock.owner === owner) delete state.locks[conversationId];
  return { ok: true };
}
function cleanup(state, now = Date.now()) {
  for (const [id, lock] of Object.entries(state.locks || {})) if (lock.until <= now) delete state.locks[id];
  return state;
}
module.exports = { acquire, release, cleanup };
