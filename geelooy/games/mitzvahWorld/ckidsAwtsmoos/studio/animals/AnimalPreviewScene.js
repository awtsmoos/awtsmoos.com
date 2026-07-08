// B"H
import { generateAnimalPreset } from "./AnimalGeneratorApp.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function createAnimalPreviewScene(species = "fox") { return { preset:generateAnimalPreset(species), camera:{ orbit:true }, rotating:true }; }
export default { createAnimalPreviewScene };
