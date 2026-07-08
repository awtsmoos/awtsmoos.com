// B"H
/**
 * @file villageCompiler.js
 * @description Chapter 364: The Emerald compiler becomes a conductor instead
 * of a crowded marketplace. Every family of work lives in compiler modules:
 * profiles, properties, roads, buildings, NPCs, trees, mazikim, terrain,
 * objectives, visuals, and summary.
 */
import { applyPropertyFeatures } from './PropertyFeatureCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyVisualEnrichment } from './EmeraldVisualEnrichment.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addBuildings } from './compiler/buildings.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createBuckets } from './compiler/buckets.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addExtraProperties } from './compiler/extraProperties.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { baseProperties } from './compiler/propertyList.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { makeRandom } from './compiler/random.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { resolveProfile, PROFILES } from './compiler/profiles.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addRoads } from './compiler/roads.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addSkyVehiclesObjectives } from './compiler/skyVehiclesObjectives.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { summarize } from './compiler/summary.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addMazikim } from './compiler/mazikim.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addTerrain } from './compiler/terrain.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addWanderers } from './compiler/wanderers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addWildTrees } from './compiler/wildTrees.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyEntryScene } from './entryScene/entrySceneCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyLifeLayer } from './life/lifeCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyPerformanceManifest } from './performance/performanceCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
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
