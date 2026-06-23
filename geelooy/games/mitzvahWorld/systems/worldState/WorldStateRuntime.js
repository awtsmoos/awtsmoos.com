// B"H
/**
 * @file WorldStateRuntime.js
 * Shared world-state layer: food, water, morale, health, wealth, safety, needs.
 * The world remembers not as prose only, but as numbers that stories can change.
 */
function clamp(v) { return Math.max(0, Math.min(100, Number(v) || 0)); }
function makeState(id) { return { id, food:50, water:50, morale:50, health:50, wealth:50, safety:50, updatedAt:Date.now() }; }
export function createWorldStateRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const regions = new Map();
  const needs = new Map();
  function region(id = 'world') { if (!regions.has(id)) regions.set(id, makeState(id)); return regions.get(id); }
  function apply(id = 'world', delta = {}) {
    const state = region(id);
    for (const [key, value] of Object.entries(delta)) if (typeof state[key] === 'number') state[key] = clamp(state[key] + Number(value || 0));
    state.updatedAt = Date.now();
    memory?.record?.('world-state-changed', { id, delta, state:{ ...state } });
    return state;
  }
  function need(id = 'village', kind = 'help', severity = 1, data = {}) {
    const entry = { id:`${id}:${kind}`, target:id, kind, severity, ...data, at:Date.now() };
    needs.set(entry.id, entry);
    memory?.record?.('world-need-created', entry);
    return entry;
  }
  function resolve(needId) { const got = needs.get(needId); needs.delete(needId); if (got) memory?.record?.('world-need-resolved', got); return got || null; }
  function report() { return { regions:[...regions.values()], needs:[...needs.values()] }; }
  return { region, apply, need, resolve, report, regions, needs };
}
export default createWorldStateRuntime;
