// B"H
/** @file AnimalTerritories.js @description Chapter 1007: animals receive land that matches ecology. */
const FALLBACK = Object.freeze({ farmBelt: [-160, -55], forestBelt: [165, 72], marshlands: [95, -142], rockyHighlands: [-235, 138], wilderness: [0, 30] });
export function animalTerritories(ctx = {}) {
  const zones = ctx.biomes?.zones || [];
  return [territory("rabbit", "farmBelt", 12, zones, 48), territory("fox", "forestBelt", 4, zones, 82), territory("deer", "forestBelt", 8, zones, 110), territory("frog", "marshlands", 10, zones, 42), territory("goat", "rockyHighlands", 6, zones, 92), territory("bird", "wilderness", 16, zones, 180)];
}
function territory(species, biome, count, zones, radius) {
  const zone = zones.find(z => z.id === biome), center = zone?.center || FALLBACK[biome] || [0, 0];
  return { species, biome, count, center: { x: center[0], z: center[1] }, radius, water: biome === "marshlands", cover: biome === "forestBelt", slope: biome === "rockyHighlands" };
}
