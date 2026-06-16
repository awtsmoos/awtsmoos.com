// B"H
/** @file AnimalTerritories.js @description Animals receive land that matches ecology, without optional syntax. */
const FALLBACK = Object.freeze({ farmBelt:[-160,-55], forestBelt:[165,72], marshlands:[95,-142], rockyHighlands:[-235,138], wilderness:[0,30] });
function zonesOf(ctx) { return ctx && ctx.biomes && Array.isArray(ctx.biomes.zones) ? ctx.biomes.zones : []; }
function zoneFor(zones, biome) { return zones.find(zone => zone.id === biome) || null; }
function centerFor(zone, biome) { const center = zone && zone.center ? zone.center : FALLBACK[biome] || [0,0]; return { x:center[0], z:center[1] }; }
function territory(species, biome, count, zones, radius) { return { species, biome, count, center:centerFor(zoneFor(zones, biome), biome), radius, water:biome === "marshlands", cover:biome === "forestBelt", slope:biome === "rockyHighlands" }; }
export function animalTerritories(ctx = {}) { const zones = zonesOf(ctx); return [territory("rabbit","farmBelt",12,zones,48), territory("fox","forestBelt",4,zones,82), territory("deer","forestBelt",8,zones,110), territory("frog","marshlands",10,zones,42), territory("goat","rockyHighlands",6,zones,92), territory("bird","wilderness",16,zones,180)]; }
