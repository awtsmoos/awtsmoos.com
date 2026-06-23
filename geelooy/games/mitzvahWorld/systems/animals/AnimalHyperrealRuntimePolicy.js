// B"H
/** @file AnimalHyperrealRuntimePolicy.js @description One-mesh animal realism policy bound to the live FPS budget. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js';
export function animalHyperrealRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget).animals;
  return {
    ...p,
    drawCallGoal: 'one-body-mesh-one-material-plus-minimal-animated-appendages',
    meshParts: ['merged torso/neck/head/hips/ribcage', 'pooled legs', 'pooled ears/tail/horns'],
    variation: ['age', 'gender', 'weight', 'markings', 'injury', 'temperament'],
    materialChannels: ['albedo-fur-atlas', 'roughness-fiber-noise', 'normal-flow-lines'],
    animationBudget: { near:p.nearHz, mid:p.midHz, far:p.farHz, horizon:0 },
    rules: ['share geometry by species family', 'share atlas material', 'avoid child mesh explosion', 'statistical herds beyond horizon']
  };
}
export default animalHyperrealRuntimePolicy;
