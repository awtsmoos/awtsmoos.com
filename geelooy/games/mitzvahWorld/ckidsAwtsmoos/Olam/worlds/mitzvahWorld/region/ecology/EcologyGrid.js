// B"H
/**
 * @file EcologyGrid.js
 * @description Chapter 982: the kingdom receives cells instead of guesses.
 */
import { chooseBiome, shapeCell } from "./EcologyRules.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { summarizeEcology } from "./EcologyStats.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const DEFAULT_BOUNDS = Object.freeze({ minX: -330, maxX: 330, minZ: -200, maxZ: 200 });
const WATER = Object.freeze([[95, -90, 95], [180, -40, 70], [20, -155, 60]]);

export function buildEcologyGrid({ terrain = {}, biomes = {}, roads = {}, spacing = 10 } = {}) {
  const bounds = terrain.bounds || DEFAULT_BOUNDS;
  const zones = biomes.zones || biomes || [];
  const cells = [];
  for (let z = bounds.minZ; z <= bounds.maxZ; z += spacing) {
    for (let x = bounds.minX; x <= bounds.maxX; x += spacing) {
      const cell = shapeCell(x, z, roads, WATER);
      cell.biome = chooseBiome(cell, zones);
      cell.spawn = spawnMask(cell);
      cells.push(cell);
    }
  }
  return {
    version: "ecology-grid-v1-android-safe",
    bounds,
    spacing,
    cells,
    summary: summarizeEcology(cells)
  };
}

function spawnMask(cell) {
  return {
    grass: cell.traffic < .75 && cell.moisture > .18,
    flowers: cell.sunlight > .45 && cell.fertility > .42 && cell.traffic < .65,
    trees: ["forestBelt", "ancientGrove", "orchardRing"].includes(cell.biome),
    rocks: cell.biome === "rockyHighlands" || cell.slope > .5,
    reeds: cell.biome === "marshlands" && cell.moisture > .62,
    mushrooms: cell.shade > .45 && cell.moisture > .42,
    wildlife: cell.traffic < .7 && cell.biome !== "villageCore"
  };
}
