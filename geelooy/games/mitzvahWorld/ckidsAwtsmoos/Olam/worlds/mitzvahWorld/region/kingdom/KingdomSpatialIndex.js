// B"H
/**
 * @file KingdomSpatialIndex.js
 * @description Nearness is revealed by buckets, never by exhausting the whole kingdom.
 */
const DEFAULT_SIZE = 40;

export function buildKingdomSpatialIndex({ wildlife = {}, houses = [], npcSchedules = {}, bucketSize = DEFAULT_SIZE } = {}) {
  const buckets = new Map();
  for (const animal of wildlife.animals || []) add(buckets, bucketSize, animal.x, animal.z, "animal", animal.species, animal.id);
  for (const house of houses || []) add(buckets, bucketSize, house.x, house.z, "house", house.profession, house.id);
  for (const schedule of npcSchedules.schedules || []) {
    const p = schedule.home || { x: 0, z: 0 };
    add(buckets, bucketSize, p.x, p.z, "npc", schedule.role, schedule.id);
  }
  const entries = [...buckets.values()];
  return { version: "kingdom-spatial-index-v1", bucketSize, buckets: entries, summary: summarize(entries) };
}

export function nearbyBuckets(index, x = 0, z = 0, radius = 80) {
  const size = index.bucketSize || DEFAULT_SIZE;
  const minX = Math.floor((x - radius) / size), maxX = Math.floor((x + radius) / size);
  const minZ = Math.floor((z - radius) / size), maxZ = Math.floor((z + radius) / size);
  const found = [];
  for (let bx = minX; bx <= maxX; bx++) for (let bz = minZ; bz <= maxZ; bz++) {
    const b = (index.buckets || []).find(v => v.id === `${bx}:${bz}`);
    if (b) found.push(b);
  }
  return found;
}

function add(map, size, x = 0, z = 0, type, kind, id) {
  const key = `${Math.floor(x / size)}:${Math.floor(z / size)}`;
  if (!map.has(key)) map.set(key, { id: key, items: [] });
  map.get(key).items.push({ type, kind, id, x, z });
}

function summarize(buckets) {
  const byType = {};
  for (const b of buckets) for (const item of b.items) byType[item.type] = (byType[item.type] || 0) + 1;
  return { buckets: buckets.length, items: Object.values(byType).reduce((a, b) => a + b, 0), byType };
}
