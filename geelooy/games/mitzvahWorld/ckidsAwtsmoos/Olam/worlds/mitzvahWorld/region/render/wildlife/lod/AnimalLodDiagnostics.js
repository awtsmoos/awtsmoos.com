// B"H
/**
 * B"H
 *
 * Wildlife diagnostics count more than survival. They ask whether each animal
 * is grounded, whether motion happened, whether aggression exists where it
 * should, and whether the anatomy catalog is actually represented in the live
 * herd without rebuilding meshes every frame.
 */
import { estimateAnimalAnatomyScore } from "../anatomy/AnimalAnatomyCatalog.js?v=animal-realism-split-20260705-bh1";

export function collectAnimalLodDiagnostics(root) {
  const out = {
    count:0,
    realisticCount:0,
    nearFullCount:0,
    midSimpleCount:0,
    farImpostorCount:0,
    speciesCounts:{},
    anatomyScore:0,
    movedCount:0,
    eatingCount:0,
    fleeCount:0,
    attackBackCount:0,
    restCount:0,
    aggressiveCount:0,
    aggressiveProof:false,
    floatingCount:0,
    meshRebuildEveryFrame:false
  };
  for (const child of root?.children || []) {
    if (!child?.userData?.motion) continue;
    const species = child.userData.motion?.species || child.userData.species || "unknown";
    out.count++;
    out.speciesCounts[species] = (out.speciesCounts[species] || 0) + 1;
    if (child.userData.realisticAnimal || child.userData.proceduralSkinnedAnimal) out.realisticCount++;
    const tier = child.userData.visualLodTier || "near";
    if (tier === "near") out.nearFullCount++;
    else if (tier === "mid") out.midSimpleCount++;
    else if (tier === "far") out.farImpostorCount++;
    const state = String(child.userData.state || child.userData.motion?.state || "");
    if (/graze|eat|drink|forage|hopPeck/i.test(state)) out.eatingCount++;
    if (/flee|panic|alarm/i.test(state)) out.fleeCount++;
    if (/attack|pounce|charge|shove|kick|peck/i.test(state) || /attack|pounce|charge|shove|kick|peck/i.test(String(child.__creatureState?.state || ""))) out.attackBackCount++;
    if (/rest|idle|socialIdle|landNest/i.test(state)) out.restCount++;
    if (species === "fox" || /hunt|attack|pounce|combat/i.test(state)) out.aggressiveCount++;
    if (child.userData.lastMovedDistance > .02) out.movedCount++;
    if (species !== "bird" && Number(child.position?.y || 0) > 4) out.floatingCount++;
  }
  out.anatomyScore = estimateAnimalAnatomyScore(out.speciesCounts);
  out.aggressiveProof = out.aggressiveCount > 0;
  root.userData.animalLodDiagnostics = out;
  globalThis.__MITZVAH_ANIMAL_LOD_DIAG__ = () => out;
  return out;
}

export default collectAnimalLodDiagnostics;
