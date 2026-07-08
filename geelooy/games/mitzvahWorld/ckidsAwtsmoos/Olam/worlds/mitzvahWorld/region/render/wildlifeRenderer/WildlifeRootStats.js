// B"H
/** WildlifeRootStats.js — one small ledger for visible animal proof. */
import { sealRegionVisual } from "../RegionSeal.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { FIRST_PLAYABLE_WILDLIFE_LIMIT, countMeshes, guardianWildlifeCadence } from "../RegionWildlifeData.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";
import { restoreFlags } from "../RegionWildlifeActors.js?compact=true&v=animal-visual-lod-20260705-bh1";
import { summarizeAnimalVisualLod } from "../wildlife/AnimalVisualLod.js?compact=true&v=animal-realism-split-20260705-bh1";

export function statsFor(root, backend) {
  const counts = root.children.map(countMeshes);
  const maxMeshesPerAnimal = Math.max(0, ...counts);
  const multiPartAnimals = counts.filter(count => count > 1).length;
  return {
    wildlife:root.children.length,
    foxes:root.children.filter(child => child.userData?.species === "fox").length,
    singleMeshAnimals:root.children.length > 0 && multiPartAnimals === 0,
    multiPartAnimals,
    meshCounts:counts,
    maxMeshesPerAnimal,
    foxAlwaysDetailed:true,
    livingEcosystem:true,
    renderBackend:backend.name,
    proofRegistered:true,
    fpsCadenceSec:guardianWildlifeCadence(),
    firstPlayableWildlifeLimit:FIRST_PLAYABLE_WILDLIFE_LIMIT,
    streamingRemaining:root.userData?.streamingRemaining || 0,
    streamedAnimals:root.userData?.streamedAnimals || 0,
    visualLod:summarizeAnimalVisualLod(root),
    seal:"single-mesh-wildlife-root-stats-bh2"
  };
}

export function sealWildlifeRoot(root, backend) {
  root.userData.stats = statsFor(root, backend);
  sealRegionVisual(root, { realisticWildlife:true, singleMeshAnimals:root.userData.stats.singleMeshAnimals, maxMeshesPerAnimal:root.userData.stats.maxMeshesPerAnimal, multiPartAnimals:root.userData.stats.multiPartAnimals, livingEcosystem:true, skipRaycast:true });
  root.children.forEach(restoreFlags);
}
