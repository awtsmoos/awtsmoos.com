/**
 * B"H
 * Dead-zone zoomed-out player camera.
 *
 * Chapter 108: the fighter was sitting too low on the phone. The camera now
 * places the player closer to the middle-upper fighting pocket, while still
 * keeping the dead-zone calm and the arena zoomed far out.
 */
export function updateCamera(state, w, h) {
  const hero = state.fighters.find(f => f.human && !f.dead) || state.fighters.find(f => !f.dead);
  if (!hero) return;
  state.camera ||= { x: 0, y: 0, zoom: 1 };
  state.cameraTarget ||= { x: hero.x, y: hero.y };
  const zoom = chooseZoom(w, h, state.fighters.length);
  const shake = stepShake(state);
  const lookAhead = Math.max(-260, Math.min(260, (hero.vx || 0) * 18));
  const desired = { x: hero.x + lookAhead, y: hero.y + Math.max(-80, Math.min(100, (hero.vy || 0) * 5)) };
  moveTargetThroughDeadZone(state.cameraTarget, desired, w / zoom, h / zoom);
  const targetX = w * 0.5;
  const targetY = h * 0.46;
  state.camera.zoom = zoom;
  state.camera.x = clamp((targetX - w / 2) / zoom - state.cameraTarget.x + w / 2, minX(state.map, w, zoom), maxX(state.map, w, zoom)) + shake.x;
  state.camera.y = clamp((targetY - h / 2) / zoom - state.cameraTarget.y + h / 2, minY(state.map, h, zoom), maxY(state.map, h, zoom)) + shake.y;
}

export function punchCamera(state, force = 1) {
  state.cameraShake = Math.max(state.cameraShake || 0, Math.min(7, force));
}

function moveTargetThroughDeadZone(target, desired, viewW, viewH) {
  const deadX = Math.min(340, viewW * 0.22);
  const deadY = Math.min(230, viewH * 0.17);
  if (desired.x < target.x - deadX) target.x = desired.x + deadX;
  else if (desired.x > target.x + deadX) target.x = desired.x - deadX;
  if (desired.y < target.y - deadY) target.y = desired.y + deadY;
  else if (desired.y > target.y + deadY) target.y = desired.y - deadY;
}

function chooseZoom(w, h, fighters) {
  const portrait = h > w * 1.25;
  const mobile = w < 820 || h < 560;
  const base = portrait ? 0.47 : mobile ? 0.55 : 0.68;
  const countPenalty = Math.min(0.06, Math.max(0, fighters - 4) * 0.01);
  return base - countPenalty;
}

function minX(map, w, zoom) { return w / 2 + w / (2 * zoom) - map.bounds.right; }
function maxX(map, w, zoom) { return w / 2 - w / (2 * zoom) - map.bounds.left; }
function minY(map, h, zoom) { return h / 2 + h / (2 * zoom) - map.bounds.bottom; }
function maxY(map, h, zoom) { return h / 2 - h / (2 * zoom) - map.bounds.top; }

function stepShake(state) {
  const amount = state.cameraShake || 0;
  if (amount <= 0) return { x: 0, y: 0 };
  state.cameraShake = Math.max(0, amount - 1.35);
  const t = state.frame || 0;
  return { x: Math.sin(t * 1.91) * amount, y: Math.cos(t * 2.17) * amount * 0.45 };
}

function clamp(value, min, max) {
  if (min > max) return (min + max) / 2;
  return Math.max(min, Math.min(max, value));
}
