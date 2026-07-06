// B"H
import { generateAnimalPreset } from "./AnimalGeneratorApp.js";
export function createAnimalPreviewScene(species = "fox") { return { preset:generateAnimalPreset(species), camera:{ orbit:true }, rotating:true }; }
export default { createAnimalPreviewScene };
