// B"H
/**
 * @file EnvironmentWearRuntime.js
 * Foot traffic becomes dirt, paths, road scars, and memory without mesh spam.
 */
function cell(position = {}, size = 8) { return `${Math.floor((position.x || 0) / size)}:${Math.floor((position.z || 0) / size)}`; }
export function createEnvironmentWearRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const heat = new Map();
  const wear = new Map();
  function traffic(position = {}, kind = 'walk', weight = 1) { const key = cell(position); const h = heat.get(key) || { key, value:0, kinds:{} }; h.value += weight; h.kinds[kind] = (h.kinds[kind] || 0) + weight; heat.set(key, h); if (h.value >= 12) wear.set(key, { key, kind:'footpath', strength:h.value, updatedAt:Date.now() }); return h; }
  function mark(target, kind = 'dirt', amount = 1) { const got = wear.get(target) || { key:target }; got[kind] = (got[kind] || 0) + amount; got.updatedAt = Date.now(); wear.set(target, got); memory?.record?.('environment-wear', got); return got; }
  function paths() { return [...wear.values()].filter(w => w.kind === 'footpath'); }
  function report() { return { heat:heat.size, wear:wear.size, paths:paths().length }; }
  return { traffic, mark, paths, report, heat, wear };
}
export default createEnvironmentWearRuntime;
