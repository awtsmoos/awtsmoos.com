// B"H
/**
 * @file AnimalLodRuntime.js
 * @description
 * Throttled wildlife visual LOD runtime. The mobile-crisp pass updates enough
 * actors per frame to collapse passive herds out of full skinned geometry
 * quickly, while still spreading work so streaming does not spike.
 */
import { applyAnimalVisualLod } from "./AnimalVisualLod.js?v=mobile-crisp-passive-herd-lod-20260705-bh2";
import { collectAnimalLodDiagnostics } from "./AnimalLodDiagnostics.js?v=animal-realism-split-20260705-bh1";

function actorList(root) {
  return (root.children || []).filter(child => child?.userData?.motion || child?.userData?.wildlifeActor || child?.userData?.species);
}

export function updateAnimalLodRuntime(root, olam, budget = 18) {
  if (!root) return null;
  const actors = actorList(root);
  if (!actors.length) return collectAnimalLodDiagnostics(root);
  root.__animalLodCursor = Number(root.__animalLodCursor || 0);
  const work = Math.min(Math.max(1, budget), actors.length);
  for (let i = 0; i < work; i++) {
    applyAnimalVisualLod(actors[(root.__animalLodCursor + i) % actors.length], olam);
  }
  root.__animalLodCursor = (root.__animalLodCursor + work) % actors.length;
  return collectAnimalLodDiagnostics(root);
}

export default updateAnimalLodRuntime;
