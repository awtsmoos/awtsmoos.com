// B"H
/** @file WaterState.js @description Cheap water memory for wells, streams, drought, rain, and village needs. */
export function createWaterState(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const sources = new Map();
  function ensure(id = 'well') {
    if (!sources.has(id)) sources.set(id, { id, level:60, purity:80, flow:20, droughtStress:0 });
    return sources.get(id);
  }
  function rain(id = 'well', amount = 1) { const s = ensure(id); s.level = Math.min(100, s.level + amount); memory?.record?.('water-rain', { id, amount }); return s; }
  function draw(id = 'well', amount = 1) { const s = ensure(id); s.level = Math.max(0, s.level - amount); if (s.level < 20) s.droughtStress += amount; return s; }
  function pollute(id = 'well', amount = 1) { const s = ensure(id); s.purity = Math.max(0, s.purity - amount); memory?.record?.('water-polluted', { id, amount }); return s; }
  function report() { return { sources:sources.size, low:[...sources.values()].filter(s => s.level < 25).length }; }
  return { ensure, rain, draw, pollute, report, sources };
}
export default createWaterState;
