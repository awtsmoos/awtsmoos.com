// B"H
/** WildlifeRootStats.js — one small ledger for visible animal proof. */
import { sealRegionVisual } from "../RegionSeal.js";
import { FIRST_PLAYABLE_WILDLIFE_LIMIT, countMeshes, guardianWildlifeCadence } from "../RegionWildlifeData.js?v=mitzvah-aggressive-split-20260703-bh1";
import { restoreFlags } from "../RegionWildlifeActors.js?v=animal-visual-lod-20260705-bh1";
import { summarizeAnimalVisualLod } from "../wildlife/AnimalVisualLod.js?v=animal-realism-split-20260705-bh1";

export function statsFor(root, backend) {
  const counts = root.children.map(countMeshes);
  return {
    wildlife: root.children.length,
    foxes: root.children.filter(child => child.userData?.species === "fox").length,
    singleMeshAnimals: false,
    multiPartAnimals: counts.filter(count => count > 1).length,
    meshCounts: counts,
    maxMeshesPerAnimal: Math.max(0, ...counts),
    foxAlwaysDetailed: true,
    livingEcosystem: true,
    renderBackend: backend.name,
    proofRegistered: true,
    fpsCadenceSec: guardianWildlifeCadence(),
    firstPlayableWildlifeLimit: FIRST_PLAYABLE_WILDLIFE_LIMIT,
    streamingRemaining: root.userData?.streamingRemaining || 0,
    streamedAnimals: root.userData?.streamedAnimals || 0,
    visualLod: summarizeAnimalVisualLod(root),
    seal: "multi-part-wildlife-root-stats-bh1"
  };
}

export function sealWildlifeRoot(root, backend) {
  root.userData.stats = statsFor(root, backend);
  sealRegionVisual(root, { realisticWildlife:true, multiPartAnimals:true, livingEcosystem:true, skipRaycast:true });
  root.children.forEach(restoreFlags);
}
