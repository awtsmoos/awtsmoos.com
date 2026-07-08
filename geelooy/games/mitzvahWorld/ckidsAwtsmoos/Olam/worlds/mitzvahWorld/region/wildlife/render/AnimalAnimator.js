// B"H
/** @file AnimalAnimator.js @description Animation compatibility facade with distance LOD. */
import { shouldAnimateAnimal } from "./AnimalAnimationLod.js?compact=true&v=single-mesh-animals-20260621-bh1";

function health(root) {
  const h = root.userData?.health;
  if (!h?.max) return;
  root.userData.healthPct = Math.max(0, Math.min(1, h.current / h.max));
}

export function animateAnimal(root, dt = 1 / 60, state = "wander") {
  if (!root?.userData) return;
  const decision = shouldAnimateAnimal(root, state);
  root.userData.animalAnimationLevel = decision.level;
  if (!decision.ok) {
    root.userData.animalAnimationSkipped = (root.userData.animalAnimationSkipped || 0) + 1;
    health(root);
    return;
  }
  const controller = root.userData.animalAnimationController;
  if (controller && typeof controller.update === "function") controller.update(dt, state);
  root.userData.animalAnimationUpdated = (root.userData.animalAnimationUpdated || 0) + 1;
  health(root);
}

export default animateAnimal;
