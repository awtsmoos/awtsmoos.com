// B"H
/** @file TerrainMemoryRuntime.js @description Terrain realism maps: slope, wetness, erosion, runoff, paths. */
export function createTerrainMemoryRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const maps = new Map();
  function setCell(map, key, value) { if (!maps.has(map)) maps.set(map, new Map()); maps.get(map).set(key, value); return value; }
  function wet(key, amount = 1) { memory?.record?.('terrain-wetness', { key, amount }); return setCell('wetness', key, amount); }
  function erode(key, amount = 1) { memory?.record?.('terrain-erosion', { key, amount }); return setCell('erosion', key, amount); }
  function path(key, strength = 1) { return setCell('footpath', key, strength); }
  function report() { return { maps:[...maps.entries()].map(([k, v]) => ({ map:k, cells:v.size })) }; }
  return { setCell, wet, erode, path, report, maps };
}
export default createTerrainMemoryRuntime;
