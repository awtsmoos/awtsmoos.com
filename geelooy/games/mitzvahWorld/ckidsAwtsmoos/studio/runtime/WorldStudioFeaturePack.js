// B"H
/** @file WorldStudioFeaturePack.js @description One click installs terrain, building, and furniture tools into the shared runtime. */
import { createStudioToolRegistry } from "./StudioToolRegistry.js";
import { terrainPaintingTools } from "./toolPacks/TerrainPaintingTools.js";
import { buildingTools } from "./toolPacks/BuildingTools.js";
import { furnitureTools } from "./toolPacks/FurnitureTools.js";
export function installWorldStudioFeaturePack(runtime) {
  const registry = createStudioToolRegistry(runtime);
  registry.registerMany([...terrainPaintingTools(), ...buildingTools(), ...furnitureTools()]);
  runtime?.markReady?.("studio:tools", { count:registry.list().length });
  return registry;
}
export default installWorldStudioFeaturePack;
