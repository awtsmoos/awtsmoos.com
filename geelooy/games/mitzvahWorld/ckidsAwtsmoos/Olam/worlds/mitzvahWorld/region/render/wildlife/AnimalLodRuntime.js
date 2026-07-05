// B"H
/** @file AnimalLodRuntime.js @description Throttled wildlife visual LOD runtime. */
import { applyAnimalVisualLod } from "./AnimalVisualLod.js?v=animal-realism-split-20260705-bh1";
import { collectAnimalLodDiagnostics } from "./AnimalLodDiagnostics.js?v=animal-realism-split-20260705-bh1";

export function updateAnimalLodRuntime(root, olam, budget = 10) {
  if (!root) return null;
  const actors = (root.children || []).filter(child => child?.userData?.motion);
  if (!actors.length) return collectAnimalLodDiagnostics(root);
  root.__animalLodCursor = Number(root.__animalLodCursor || 0);
  for (let i = 0; i < Math.min(budget, actors.length); i++) {
    applyAnimalVisualLod(actors[(root.__animalLodCursor + i) % actors.length], olam);
  }
  root.__animalLodCursor = (root.__animalLodCursor + budget) % actors.length;
  return collectAnimalLodDiagnostics(root);
}

export default updateAnimalLodRuntime;
