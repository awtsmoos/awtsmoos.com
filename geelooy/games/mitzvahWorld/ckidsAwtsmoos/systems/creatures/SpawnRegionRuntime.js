// B"H
/** @file SpawnRegionRuntime.js @description Spawn-region declarations for camps, nests, dens, and pens. */
import { TerritoryRegistry } from "./TerritoryRuntime.js";
export function spawnRegions() { return TerritoryRegistry.map(t => ({ id: `${t.id}_spawn`, territoryId: t.id, label: t.label, species: t.species, center: t.center, radius: t.radius, peaceful: t.peaceful, maxAlive: t.peaceful ? 12 : 6 })); }
export default { spawnRegions };
