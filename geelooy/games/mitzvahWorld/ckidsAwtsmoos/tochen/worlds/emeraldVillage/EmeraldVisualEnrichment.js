// B"H
/**
 * @file EmeraldVisualEnrichment.js
 * @description Chapter 475: The beauty pass now receives a density profile.
 * The same Awtsmoos-village can appear lavish on strong vessels and lighter on
 * fragile ones without pretending all devices are equal.
 */
import { addArchitecture, addBenches, addCrowdMarkers, addDepthTrees, addEntryTree, addHouseMicro, addLevelGuideMarker, addLightingProps, addMarket, addObjectiveMarkers, addPlaza, addRoadEdges, addSigns, addSparkles, addVista, addWaterFeatures, enrichNpc } from './visualPasses/visualIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addDistrictAccents } from './visualPasses/districtAccents.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addScreenshotDetails } from './visualPasses/screenshotDetailPass.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { validateEmeraldVisualBudget } from './visualPasses/visualBudgetValidator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { visualDensity } from './visualPasses/visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export { enrichNpc };
export function applyVisualEnrichment(n, properties, roads = [], profile = {}) {
  const density = visualDensity(profile);
  addEntryTree(n); addPlaza(n); addLevelGuideMarker(n); addObjectiveMarkers(n); addLightingProps(n);
  addMarket(n, density); addSigns(n); addWaterFeatures(n); addDepthTrees(n, density);
  addArchitecture(n, properties, density); addHouseMicro(n, properties, density); addRoadEdges(n, roads, density);
  addBenches(n); addCrowdMarkers(n, density); addVista(n, density); addScreenshotDetails(n, density);
  addSparkles(n, density); addDistrictAccents(n, properties, density);
  n.__visualEnrichment = { landmark: true, plaza: true, levelGuideMarker: true, objectives: true, market: true, architecture: true, microProps: true, roadEdges: true, waterFeatures: true, vista: true, crowdMarkers: true, districtAccents: true, sparkles: true, screenshotDetails: true, npcStats: true, budget: true, density: profile.visualDensity || 'mobile' };
  validateEmeraldVisualBudget(n, profile);
  return n;
}
