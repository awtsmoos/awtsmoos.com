// B"H
/** @file TerritoryRuntime.js @description Creature territories, camps, dens, nests, and pens. */
export const TerritoryRegistry = Object.freeze([
  { id: "village_livestock", label: "Village Pens", species: ["chicken", "sheep", "cow"], center: { x: 20, z: 20 }, radius: 36, peaceful: true },
  { id: "wheat_bird_nests", label: "Bird Nests", species: ["bird"], center: { x: 45, z: 8 }, radius: 42, peaceful: false },
  { id: "orchard_deer_grove", label: "Deer Grove", species: ["deer"], center: { x: 60, z: -35 }, radius: 54, peaceful: true },
  { id: "fox_den", label: "Fox Den", species: ["fox"], center: { x: 120, z: -42 }, radius: 58, peaceful: false },
  { id: "wolf_edge", label: "Wolf Edge", species: ["wolf"], center: { x: 180, z: -90 }, radius: 70, peaceful: false }
]);
export function territoryForPosition(pos = {}) { return TerritoryRegistry.find(t => Math.hypot((pos.x || 0) - t.center.x, (pos.z || 0) - t.center.z) <= t.radius) || null; }
export default { TerritoryRegistry, territoryForPosition };
