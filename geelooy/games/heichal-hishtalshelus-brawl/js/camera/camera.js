/**
 * B"H
 * Player-first camera for large arenas.
 *
 * Chapter 78: the camera follows now, not eventually. It locks the human into
 * readable space every frame, with only tiny lookahead and impact shake. No bot
 * can steal the center of the screen from the player.
 */
export function updateCamera(state, w, h) {
  const hero = state.fighters.find(f => f.human && !f.dead) || state.fighters.find(f => !f.dead);
  if (!hero) return;
  const shake = stepShake(state);
  const lookAhead = Math.max(-140, Math.min(140, (hero.vx || 0) * 14));
  const focusX = hero.x + lookAhead;
  const focusY = hero.y - 70 + Math.max(-60, Math.min(90, (hero.vy || 0) * 5));
  state.camera.x = clamp(w / 2 - focusX, w - state.map.bounds.right, -state.map.bounds.left) + shake.x;
  state.camera.y = clamp(h * 0.56 - focusY, h - state.map.bounds.bottom, -state.map.bounds.top) + shake.y;
  state.camera.zoom = 1;
}

export function punchCamera(state, force = 1) {
  state.cameraShake = Math.max(state.cameraShake || 0, Math.min(12, force));
}

function stepShake(state) {
  const amount = state.cameraShake || 0;
  if (amount <= 0) return { x: 0, y: 0 };
  state.cameraShake = Math.max(0, amount - 1.1);
  const t = state.frame || 0;
  return { x: Math.sin(t * 1.91) * amount, y: Math.cos(t * 2.17) * amount * 0.6 };
}

function clamp(value, min, max) {
  if (min > max) return (min + max) / 2;
  return Math.max(min, Math.min(max, value));
}
