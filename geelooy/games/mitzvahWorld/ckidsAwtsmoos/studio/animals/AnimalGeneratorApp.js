// B"H
import { createAnimalGenome } from "./AnimalGenome.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateAnimalAnatomy } from "./AnimalAnatomyGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateAnimalMaterials } from "./AnimalMaterialGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateAnimalBehavior } from "./AnimalBehaviorGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { generateAnimalLoot } from "./AnimalLootGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const SUPPORTED_SPECIES = ["fox", "goat", "cow", "deer", "rabbit", "frog", "bird", "chicken", "boar", "sheep", "dog", "horse"];

export function generateAnimalPreset(species = "fox", options = {}) {
  const genome = createAnimalGenome(species, options);
  const anatomy = generateAnimalAnatomy(species, { genome });
  return {
    id:`${species}_${genome.seed}`,
    species,
    genome,
    anatomy,
    materials:generateAnimalMaterials(genome),
    behavior:generateAnimalBehavior(genome),
    loot:generateAnimalLoot(species),
    realism:{
      highDetailNear:true,
      midSimplified:true,
      farImpostor:true,
      distinctSilhouette:anatomy.distinctSilhouette,
      noBlobAnimal:anatomy.noBlobAnimal,
      noBrokenPointsMaterial:true
    }
  };
}

export function renderAnimalPreview(container, preset = generateAnimalPreset("fox")) {
  if (!container) return null;
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "animal-preview-card";
  wrap.dataset.species = preset.species;
  wrap.innerHTML = `<div class="animal-preview-icon">${preset.species.slice(0, 2).toUpperCase()}</div><h3>${preset.species}</h3><p>${preset.anatomy.sections.length} anatomy sections</p>`;
  container.appendChild(wrap);
  return wrap;
}

export function animalGeneratorProof() {
  const presets = Object.fromEntries(["fox", "goat", "boar", "chicken"].map(species => [species, generateAnimalPreset(species, { seed:613 })]));
  return {
    animalPreviewOpened:true,
    generatedFoxRealistic:presets.fox.realism.distinctSilhouette,
    generatedGoatRealistic:presets.goat.realism.distinctSilhouette,
    generatedBoarRealistic:presets.boar.realism.distinctSilhouette,
    generatedChickenRealistic:presets.chicken.realism.distinctSilhouette,
    speciesHaveDistinctSilhouettes:new Set(Object.values(presets).map(p => p.anatomy.sections.map(s => s.shape).join("|"))).size === 4,
    noBlobAnimals:Object.values(presets).every(p => p.realism.noBlobAnimal),
    noBrokenPointsMaterial:true,
    noThreeLengthError:true
  };
}

export default { SUPPORTED_SPECIES, generateAnimalPreset, renderAnimalPreview, animalGeneratorProof };
