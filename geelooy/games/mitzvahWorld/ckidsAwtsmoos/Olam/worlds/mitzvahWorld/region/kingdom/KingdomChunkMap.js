// B"H
/**
 * @file KingdomChunkMap.js
 * @description The garden becomes kingdoms of cells: asleep far away, awake near the heart.
 */
const DEFAULT_SIZE = 80;

export function buildKingdomChunkMap({ ecology = {}, houses = [], wildlife = {}, npcSchedules = {}, chunkSize = DEFAULT_SIZE } = {}) {
  const chunks = new Map();
  for (const cell of ecology.cells || []) touch(chunks, cell.x, cell.z, chunkSize).ecologyCells++;
  for (const house of houses || []) touch(chunks, house.x, house.z, chunkSize).houses++;
  for (const animal of wildlife.animals || []) touch(chunks, animal.x, animal.z, chunkSize).animals++;
  for (const schedule of npcSchedules.schedules || []) {
    const p = schedule.home || schedule.work || { x: 0, z: 0 };
    touch(chunks, p.x, p.z, chunkSize).npcSchedules++;
  }
  const list = [...chunks.values()].sort((a, b) => a.id.localeCompare(b.id));
  return { version: "kingdom-chunk-map-v1", chunkSize, chunks: list, summary: summarize(list) };
}

export function chunkKey(x = 0, z = 0, size = DEFAULT_SIZE) {
  return `${Math.floor(x / size)}:${Math.floor(z / size)}`;
}

function touch(map, x = 0, z = 0, size) {
  const id = chunkKey(x, z, size);
  if (!map.has(id)) map.set(id, { id, x: Math.floor(x / size), z: Math.floor(z / size), ecologyCells: 0, houses: 0, animals: 0, npcSchedules: 0, tier: 4 });
  return map.get(id);
}

function summarize(chunks) {
  return {
    chunks: chunks.length,
    ecologyCells: sum(chunks, "ecologyCells"),
    houses: sum(chunks, "houses"),
    animals: sum(chunks, "animals"),
    npcSchedules: sum(chunks, "npcSchedules")
  };
}
function sum(list, key) { return list.reduce((n, item) => n + (item[key] || 0), 0); }
