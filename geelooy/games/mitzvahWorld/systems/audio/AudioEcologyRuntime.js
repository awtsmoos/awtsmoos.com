// B"H
/** @file AudioEcologyRuntime.js @description Cheap ambient audio ecology: sources, distance, memory, no heavy mixing loop. */
export function createAudioEcologyRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const sources = new Map();
  function source(id, kind, position = {}, radius = 80) { const s = { id, kind, position, radius, active:true, at:Date.now() }; sources.set(id, s); memory?.record?.('audio-source-created', s); return s; }
  function village(id = 'village-audio') { return source(id, 'village-work-learning-prayer', { x:0, z:0 }, 180); }
  function wind(id = 'wind-field') { return source(id, 'wind-trees-grass', { x:0, z:0 }, 500); }
  function report() { return { sources:sources.size, kinds:[...new Set([...sources.values()].map(s => s.kind))] }; }
  return { source, village, wind, report, sources };
}
export default createAudioEcologyRuntime;
