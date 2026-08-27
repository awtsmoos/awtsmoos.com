// B"H
const { nowIso, clone } = require("./state");
function makeLeaseStore(input = {}) {
  return { leases: [], maxConcurrentAgents: input.maxConcurrentAgents || 8 };
}
function activeLeases(store, at = Date.now()) {
  return (store.leases || []).filter(l => l.status === "active" && l.expiresAtMs > at);
}
function acquireLease(store, request = {}) {
  const next = clone(store || makeLeaseStore());
  const active = activeLeases(next);
  if (active.length >= next.maxConcurrentAgents) {
    return { ok: false, reason: "agent_concurrency_limit", store: next, activeCount: active.length };
  }
  const ttlMs = request.ttlMs || 120000;
  const lease = { id: request.id || `lease_${Date.now()}_${active.length + 1}`, agentId: request.agentId || "agent", status: "active", createdAt: nowIso(), expiresAtMs: Date.now() + ttlMs };
  next.leases = [...active, lease];
  return { ok: true, lease, store: next, activeCount: active.length + 1 };
}
function releaseLease(store, id) {
  const next = clone(store || makeLeaseStore());
  next.leases = (next.leases || []).map(l => l.id === id ? { ...l, status: "released", releasedAt: nowIso() } : l);
  return next;
}
module.exports = { makeLeaseStore, activeLeases, acquireLease, releaseLease };
