// B"H
/**
 * @file villageCompiler.js
 * @description Chapter 364: The Emerald compiler becomes a conductor instead
 * of a crowded marketplace. Every family of work lives in compiler modules:
 * profiles, properties, roads, buildings, NPCs, trees, mazikim, terrain,
 * objectives, visuals, and summary.
 */
import { applyPropertyFeatures } from './PropertyFeatureCompiler.js';
import { applyVisualEnrichment } from './EmeraldVisualEnrichment.js';
import { addBuildings } from './compiler/buildings.js';
import { createBuckets } from './compiler/buckets.js';
import { addExtraProperties } from './compiler/extraProperties.js';
import { baseProperties } from './compiler/propertyList.js';
import { makeRandom } from './compiler/random.js';
import { resolveProfile, PROFILES } from './compiler/profiles.js';
import { addRoads } from './compiler/roads.js';
import { addSkyVehiclesObjectives } from './compiler/skyVehiclesObjectives.js';
import { summarize } from './compiler/summary.js';
import { addMazikim } from './compiler/mazikim.js';
import { addTerrain } from './compiler/terrain.js';
import { addWanderers } from './compiler/wanderers.js';
import { addWildTrees } from './compiler/wildTrees.js';
import { applyEntryScene } from './entryScene/entrySceneCompiler.js';
import { applyLifeLayer } from './life/lifeCompiler.js';
import { applyPerformanceManifest } from './performance/performanceCompiler.js';
class VillageCompiler {
  static compile(options = {}) {
    const profile = resolveProfile(options), rand = makeRandom(profile.seed), n = createBuckets(), properties = baseProperties();
    addSkyVehiclesObjectives(n);
    addExtraProperties(properties, profile, rand);
    addRoads(n, properties);
    addBuildings(n, properties);
    applyPropertyFeatures(n, properties);
    addWanderers(n);
    addWildTrees(n, profile, rand);
    addMazikim(n, profile, rand);
    addTerrain(n, properties, profile);
    applyVisualEnrichment(n, properties, Object.values(n.ProceduralRoad), profile);
    applyEntryScene(n);
    applyEntryScene(n);
    applyLifeLayer(n);
    applyPerformanceManifest(n, profile);
    summarize(n, profile, properties);
    return n;
  }
}
export function compileVillage(options = {}) { return VillageCompiler.compile(options); }
export { PROFILES as EMERALD_VILLAGE_PROFILES };
