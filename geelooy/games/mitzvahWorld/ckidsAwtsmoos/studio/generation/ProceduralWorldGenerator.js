// B"H
import { createBlankWorldProject } from "../core/StudioState.js";
import { generateVillage } from "./VillageGenerator.js";
import { generateBiome } from "./BiomeGenerator.js";
export function generateProceduralWorld(options = {}) {
  const project = createBlankWorldProject({ name:options.name || "Generated World" });
  project.generation = { biome:generateBiome(options.seed), village:generateVillage(options.seed) };
  return project;
}
export default { generateProceduralWorld };
