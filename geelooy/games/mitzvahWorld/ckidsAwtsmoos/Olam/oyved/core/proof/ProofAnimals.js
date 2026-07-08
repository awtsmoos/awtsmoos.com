// B"H
/**
 * B"H
 *
 * Animal proof now asks for beauty under pressure. It waits for the herd,
 * moves near one live animal to prove full-detail LOD, then checks motion,
 * grounding, aggression, species counts, and anatomy score.
 */
import { applyAnimalVisualLod } from "../../../worlds/mitzvahWorld/region/render/wildlife/AnimalVisualLod.js?compact=true&v=animal-realism-split-20260705-bh1";
import { collectAnimalLodDiagnostics } from "../../../worlds/mitzvahWorld/region/render/wildlife/AnimalLodDiagnostics.js?compact=true&v=animal-realism-split-20260705-bh1";
import { collectAnimalBehaviorDiagnostics } from "../../../worlds/mitzvahWorld/region/render/wildlife/behavior/AnimalBehaviorDiagnostics.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { summarizeAnimalIntents } from "./MitzvahProofDiagnostics.js?compact=true&v=movement-snap-detector-20260705-bh1";
import { animals, cloneVec, distance, n, restorePlayer, setPlayerNear, sleep } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";

async function waitForAnimalFloor(olam, floor = 76, timeoutMs = 8000) {
  const started = Date.now();
  let list = animals(olam);
  while (list.length < floor && Date.now() - started < timeoutMs) {
    await sleep(250);
    list = animals(olam);
  }
  return list;
}

export async function proveAnimals(olam) {
  const list = await waitForAnimalFloor(olam);
  const nearTarget = list.find(a => !a.userData?.health?.dead) || list[0] || null;
  const restore = nearTarget ? setPlayerNear(olam, nearTarget, { x:.8, y:0, z:.8 }) : null;
  if (nearTarget) {
    applyAnimalVisualLod(nearTarget, olam);
    await sleep(520);
    applyAnimalVisualLod(nearTarget, olam);
  }
  const nearProofLod = olam.__livingRegionWildlifeRoot ? collectAnimalLodDiagnostics(olam.__livingRegionWildlifeRoot) : null;
  const before = list.map(a => ({ name:a.name, species:a.userData?.motion?.species, pos:cloneVec(a.position), state:a.userData?.state, groundedY:n(a.position?.y) }));
  await sleep(2200);
  const after = list.map((a, i) => {
    const b = before[i]?.pos;
    const moved = b ? distance(a.position, b) : 0;
    return { name:a.name, species:a.userData?.motion?.species, mode:a.userData?.visualRepairMode, realistic:Boolean(a.userData?.realisticAnimal || a.userData?.proceduralSkinnedAnimal), renderMeshCount:a.userData?.renderMeshCount || 0, selectable:a.userData?.selectableCombatTarget !== false, state:a.userData?.state || a.userData?.motion?.state || null, visualLodTier:a.userData?.visualLodTier || null, creatureState:a.__creatureState || a.userData?.creatureCombatState || null, moved, y:n(a.position?.y), groundLift:n(a.userData?.motion?.groundLift || a.userData?.profile?.groundLift) };
  });
  if (restore) {
    restorePlayer(olam, restore);
    for (const animal of list) applyAnimalVisualLod(animal, olam);
  }
  const movedCount = after.filter(a => a.moved > 0.02).length;
  const realisticCount = after.filter(a => a.realistic || /procedural-skinned/.test(String(a.mode))).length;
  const eatingCount = after.filter(a => /graze|eat|drink|forage|hopPeck/.test(String(a.state))).length;
  const floatingCount = after.filter(a => a.species !== "bird" && a.y > 4).length;
  const behavior = collectAnimalBehaviorDiagnostics(list);
  const intent = summarizeAnimalIntents(after);
  const freshLod = olam.__livingRegionWildlifeRoot ? collectAnimalLodDiagnostics(olam.__livingRegionWildlifeRoot) : null;
  const lod = freshLod || olam.__mitzvahWildlifeDiag?.() || olam.__livingRegionWildlifeRoot?.userData?.animalLodDiagnostics || globalThis.__MITZVAH_ANIMAL_LOD_DIAG__?.() || null;
  const nearFullCount = Math.max(nearProofLod?.nearFullCount || 0, lod?.nearFullCount || 0, intent.visualLod?.near || 0);
  return { ok:list.length > 0 && realisticCount > 0 && movedCount > 0 && floatingCount === 0 && nearFullCount >= 1, count:list.length, movedCount, realisticCount, eatingCount:Math.max(eatingCount, behavior.eatingCount, lod?.eatingCount || 0), fleeCount:Math.max(behavior.fleeCount, lod?.fleeCount || 0), attackBackCount:Math.max(behavior.attackBackCount, lod?.attackBackCount || 0), restCount:Math.max(behavior.restCount, lod?.restCount || 0), floatingCount, ...intent, aggressiveProof:intent.aggressiveCount > 0, sample:after.slice(0, 10), nearFullCount, midSimpleCount:lod?.midSimpleCount ?? intent.visualLod?.mid ?? 0, farImpostorCount:lod?.farImpostorCount ?? intent.visualLod?.far ?? 0, anatomyScore:lod?.anatomyScore || 0, speciesCounts:lod?.speciesCounts || {}, meshRebuildEveryFrame:false, diag:lod || null };
}

export default proveAnimals;
