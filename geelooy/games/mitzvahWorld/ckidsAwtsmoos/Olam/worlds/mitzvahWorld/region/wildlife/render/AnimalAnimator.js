// B"H
/** @file AnimalAnimator.js @description Animation compatibility facade; real clips live in backend controller. */
function health(root) { const h = root.userData && root.userData.health, bar = root.userData && root.userData.healthBar; if (!h || !bar || !bar.fg) return; const pct = Math.max(0, Math.min(1, h.current / h.max)); bar.fg.scale.x = pct; bar.fg.position.x = -(.72 - .72 * pct) * .5; }
export function animateAnimal(root, dt = 1 / 60, state = "wander") {
  if (!root || !root.userData) return; const controller = root.userData.animalAnimationController; if (controller && typeof controller.update === "function") controller.update(dt, state); health(root);
}
export default animateAnimal;
