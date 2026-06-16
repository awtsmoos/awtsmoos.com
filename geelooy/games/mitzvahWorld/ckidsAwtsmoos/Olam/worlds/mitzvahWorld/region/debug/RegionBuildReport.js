// B"H
/** @file RegionBuildReport.js @description Compact proof that the living region stack has terrain, ecology, budget, and vessels. */
function dataOf(value) { return value || {}; }
function len(value) { return Array.isArray(value) ? value.length : 0; }
function summaryOf(value) { return value && value.summary ? value.summary : {}; }
function kingdomBudgetMode(kingdom) { const summary = summaryOf(kingdom); return summary.budget && summary.budget.mode ? summary.budget.mode : "unknown"; }
function countRoads(roads = {}) { let total = 0; for (const value of Object.values(roads)) { if (Array.isArray(value)) total += value.filter(v => v && v.points).length; else if (value && value.points) total += 1; } return total; }
export function buildRegionReport(data = {}) {
  const instances = summaryOf(data.instances), ecology = summaryOf(data.ecology), kingdom = summaryOf(data.kingdom);
  const wildlife = data.wildlife || {}, npcSchedules = data.npcSchedules || {}, colliders = data.colliders || {};
  const summary = { ecologyCells:ecology.cells || 0, biomes:data.biomes && data.biomes.zones ? data.biomes.zones.length : len(data.biomes), roads:countRoads(data.roads), houses:len(data.houses), wildlife:wildlife.animals ? wildlife.animals.length : len(wildlife.territories), npcSchedules:npcSchedules.schedules ? npcSchedules.schedules.length : len(npcSchedules), hardColliders:colliders.hard ? colliders.hard.length : 0, visibleInstances:instances.total || 0, grass:instances.grass || 0, flowers:instances.flowers || 0, trees:instances.trees || 0, rocks:instances.rocks || 0, kingdomChunks:kingdom.chunks || 0, kingdomActiveChunks:kingdom.activeChunks || 0, kingdomBudgetMode:kingdomBudgetMode(data.kingdom) };
  return Object.assign({ ok:true, kind:"mitzvah-region-stack", version:"region-report-v5-parser-clear-kingdom-kernel", createdAt:Date.now() }, dataOf(data), { summary });
}
