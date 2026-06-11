/**
 * B"H
 * Smash-like camera for bigger arenas.
 *
 * Chapter 48: the camera is no longer a passive eye. When a strike tears the
 * air, the eye flinches. It follows the human, honors the nearest rival, clamps
 * to the vast palace, and trembles only as much as the blow deserves.
 */
export function updateCamera(state, w, h) {
  const hero = state.fighters.find(f => f.human && !f.dead) || state.fighters.find(f => !f.dead);
  if (!hero) return;
  const rivals = state.fighters.filter(f => !f.dead && f !== hero)
    .sort((a, b) => Math.abs(a.x - hero.x) - Math.abs(b.x - hero.x));
  const rival = rivals[0] || hero;
  const focusX = hero.x * 0.72 + rival.x * 0.28;
  const focusY = hero.y * 0.78 + rival.y * 0.22;
  const shake = stepShake(state);
  const desiredX = clamp(w / 2 - focusX, w - state.map.bounds.right, -state.map.bounds.left) + shake.x;
  const desiredY = clamp(h * 0.62 - focusY, h - state.map.bounds.bottom, -state.map.bounds.top) + shake.y;
  state.camera.x += (desiredX - state.camera.x) * 0.14;
  state.camera.y += (desiredY - state.camera.y) * 0.14;
  state.camera.zoom = 1 + shake.zoom;
}

export function punchCamera(state, force = 1) {
  state.cameraShake = Math.max(state.cameraShake || 0, Math.min(18, force));
}

function stepShake(state) {
  const amount = state.cameraShake || 0;
  if (amount <= 0) return { x: 0, y: 0, zoom: 0 };
  state.cameraShake = Math.max(0, amount - 0.7);
  const t = state.frame || 0;
  return {
    x: Math.sin(t * 1.91) * amount,
    y: Math.cos(t * 2.17) * amount * 0.7,
    zoom: Math.min(0.028, amount * 0.0018)
  };
}

function clamp(value, min, max) {
  if (min > max) return (min + max) / 2;
  return Math.max(min, Math.min(max, value));
}
