// B"H
/**
 * @file RegionBuildReport.js
 * @description Chapter 1011: the report now counts both the seed village and kingdom kernel.
 */
export function buildRegionReport(data) {
  const instances = data.instances?.summary || {};
  const ecology = data.ecology?.summary || {};
  const kingdom = data.kingdom?.summary || {};
  const roads = countRoads(data.roads);
  const summary = {
    ecologyCells: ecology.cells || 0,
    biomes: data.biomes?.zones?.length || data.biomes?.length || 0,
    roads,
    houses: data.houses?.length || 0,
    wildlife: data.wildlife?.animals?.length || data.wildlife?.territories?.length || 0,
    npcSchedules: data.npcSchedules?.schedules?.length || data.npcSchedules?.length || 0,
    hardColliders: data.colliders?.hard?.length || 0,
    visibleInstances: instances.total || 0,
    grass: instances.grass || 0,
    flowers: instances.flowers || 0,
    trees: instances.trees || 0,
    rocks: instances.rocks || 0,
    kingdomChunks: kingdom.chunks || 0,
    kingdomActiveChunks: kingdom.activeChunks || 0,
    kingdomBudgetMode: kingdom.budget?.mode || "unknown"
  };
  return { ok: true, kind: "mitzvah-region-stack", version: "region-report-v4-kingdom-kernel", createdAt: Date.now(), ...data, summary };
}

function countRoads(roads = {}) {
  let total = 0;
  for (const value of Object.values(roads)) {
    if (Array.isArray(value)) total += value.filter(v => v?.points).length;
    else if (value?.points) total += 1;
  }
  return total;
}
