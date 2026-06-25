// B"H
/**
 * Counters are small windows in the engine wall.
 * They show what was drawn, skipped, sorted, uploaded, and pooled,
 * so performance becomes evidence instead of imagination.
 */
export function createDebugCounters() {
  const data = { drawn: 0, skipped: 0, total: 0, sorted: 0, textureBinds: 0, uploads: 0, poolCreated: 0, poolReused: 0 };
  function reset() { for (const k in data) data[k] = 0; }
  function add(next = {}) { for (const k in next) if (k in data) data[k] += next[k] || 0; return snapshot(); }
  function set(next = {}) { for (const k in next) if (k in data) data[k] = next[k] || 0; return snapshot(); }
  function snapshot() { return { ...data }; }
  return { reset, add, set, snapshot };
}
