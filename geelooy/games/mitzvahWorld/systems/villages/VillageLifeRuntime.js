// B"H
/** @file VillageLifeRuntime.js @description Village economy, needs, growth, and community pulse. */
export function createVillageLifeRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__, state = globalThis.__MITZVAH_WORLD_STATE__) {
  const villages = new Map();
  function ensure(id = 'village') { if (!villages.has(id)) villages.set(id, { id, economy:50, growth:0, needs:[] }); return villages.get(id); }
  function need(id, kind, severity = 1) { const v = ensure(id); const n = { id:`${id}:${kind}:${Date.now()}`, kind, severity }; v.needs.push(n); state?.need?.(id, kind, severity); memory?.village?.remember?.(id, 'need', n); return n; }
  function grow(id, amount = 1) { const v = ensure(id); v.growth += amount; state?.apply?.(id, { morale:amount, wealth:amount }); memory?.village?.remember?.(id, 'growth', { value:amount }); return v; }
  function report() { return { villages:villages.size, needs:[...villages.values()].reduce((s, v) => s + v.needs.length, 0) }; }
  return { ensure, need, grow, report, villages };
}
export default createVillageLifeRuntime;
