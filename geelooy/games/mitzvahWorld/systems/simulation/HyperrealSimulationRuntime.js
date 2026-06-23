// B"H
/**
 * @file HyperrealSimulationRuntime.js
 * Distance-tier scheduler plus far-world statistics: alive near, cheap far away.
 */
export function createHyperrealSimulationRuntime(policy = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__?.simulation) {
  const items = new Set();
  const stats = new Map();
  const hz = { near:policy?.nearHz || 30, mid:policy?.midHz || 4, far:policy?.farHz || 1, horizon:0 };
  function add(item, tier = 'far') { item.tier = tier; items.add(item); return item; }
  function stat(kind, amount = 1) { stats.set(kind, (stats.get(kind) || 0) + amount); return stats.get(kind); }
  function due(item, now) { const rate = hz[item.tier] || 0; if (!rate) return false; const gap = 1000 / rate; if (!item._lastHyperSim || now - item._lastHyperSim >= gap) { item._lastHyperSim = now; return true; } return false; }
  function tick(now = performance.now()) { return [...items].filter(item => due(item, now)); }
  function report() { return { items:items.size, stats:Object.fromEntries(stats), hz }; }
  return { add, stat, tick, report, items, stats };
}
export default createHyperrealSimulationRuntime;
