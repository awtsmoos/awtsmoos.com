// B"H
/**
 * @file AgricultureState.js
 * Crops, soil, drought, rain, and harvest become cheap state instead of heavy geometry.
 */
export function createAgricultureState(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const fields = new Map();
  function ensure(id = 'field') {
    if (!fields.has(id)) fields.set(id, { id, fertility:50, moisture:50, crop:'wheat', growth:0, stress:0 });
    return fields.get(id);
  }
  function rain(id, amount = 1) { const f = ensure(id); f.moisture = Math.min(100, f.moisture + amount); memory?.record?.('agriculture-rain', { id, amount }); return f; }
  function drought(id, amount = 1) { const f = ensure(id); f.moisture = Math.max(0, f.moisture - amount); f.stress += amount; memory?.record?.('agriculture-drought', { id, amount }); return f; }
  function grow(id, amount = 1) { const f = ensure(id); f.growth = Math.min(100, f.growth + amount * (f.moisture / 50)); return f; }
  function report() { return { fields:fields.size, stressed:[...fields.values()].filter(f => f.stress > 5).length }; }
  return { ensure, rain, drought, grow, report, fields };
}
export default createAgricultureState;
