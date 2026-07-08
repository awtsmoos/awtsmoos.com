// B"H
import { createBlankWorldProject } from "../core/StudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateVillage } from "./VillageGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateBiome } from "./BiomeGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function generateProceduralWorld(options = {}) {
  const project = createBlankWorldProject({ name:options.name || "Generated World" });
  project.generation = { biome:generateBiome(options.seed), village:generateVillage(options.seed) };
  return project;
}
export default { generateProceduralWorld };
