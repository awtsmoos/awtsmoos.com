// B"H
/** @file WorldStudioFeaturePack.js @description One click installs terrain, building, and furniture tools into the shared runtime. */
import { createStudioToolRegistry } from "./StudioToolRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { terrainPaintingTools } from "./toolPacks/TerrainPaintingTools.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildingTools } from "./toolPacks/BuildingTools.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { furnitureTools } from "./toolPacks/FurnitureTools.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installWorldStudioFeaturePack(runtime) {
  const registry = createStudioToolRegistry(runtime);
  registry.registerMany([...terrainPaintingTools(), ...buildingTools(), ...furnitureTools()]);
  runtime?.markReady?.("studio:tools", { count:registry.list().length });
  return registry;
}
export default installWorldStudioFeaturePack;
