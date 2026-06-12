/**
 * B"H
 * Player/action camera.
 *
 * Chapter 249: the camera stops worshiping empty sky. While the player lives it
 * follows closer, holding the fighter lower on the screen so the stage ahead is
 * visible and the body feels grounded. When the player falls, the lens becomes a
 * wide witness over the remaining war.
 */
export function updateCamera(state, w, h) {
  const focus = chooseFocus(state);
  if (!focus) return;
  state.camera ||= { x: 0, y: 0, zoom: 1 };
  state.cameraTarget ||= { x: focus.x, y: focus.y };
  const spectator = isSpectating(state);
  const zoom = chooseZoom(w, h, livingFighters(state).length, spectator, focus.spread || 0);
  const shake = stepShake(state);
  const lookAhead = spectator ? 0 : clamp((focus.vx || 0) * 14, -180, 180);
  const desired = { x: focus.x + lookAhead, y: focus.y + clamp((focus.vy || 0) * 4, -60, 80) };
  moveTargetThroughDeadZone(state.cameraTarget, desired, w / zoom, h / zoom, spectator);
  const targetX = w * 0.5;
  const targetY = h * (spectator ? 0.52 : 0.62);
  state.camera.zoom = zoom;
  state.camera.x = clamp((targetX - w / 2) / zoom - state.cameraTarget.x + w / 2, minX(state.map, w, zoom), maxX(state.map, w, zoom)) + shake.x;
  state.camera.y = clamp((targetY - h / 2) / zoom - state.cameraTarget.y + h / 2, minY(state.map, h, zoom), maxY(state.map, h, zoom)) + shake.y;
  state.camera.spectating = spectator;
}

export function punchCamera(state, force = 1) {
  state.cameraShake = Math.max(state.cameraShake || 0, Math.min(7, force));
}

function chooseFocus(state) {
  const hero = state.fighters.find(f => f.human && !f.dead && !f.hidden);
  if (hero) return hero;
  const living = livingFighters(state);
  if (!living.length) return state.fighters.find(f => !f.dead) || null;
  const hot = hottestPair(living) || living;
  return averageFocus(hot);
}

function averageFocus(fighters) {
  const x = fighters.reduce((sum, f) => sum + f.x, 0) / fighters.length;
  const y = fighters.reduce((sum, f) => sum + f.y, 0) / fighters.length;
  const vx = fighters.reduce((sum, f) => sum + (f.vx || 0), 0) / fighters.length;
  const vy = fighters.reduce((sum, f) => sum + (f.vy || 0), 0) / fighters.length;
  const spread = fighters.reduce((max, f) => Math.max(max, Math.hypot(f.x - x, f.y - y)), 0);
  return { x, y, vx, vy, spread };
}

function hottestPair(fighters) {
  if (fighters.length <= 2) return fighters;
  let best = null;
  let score = Infinity;
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const a = fighters[i];
      const b = fighters[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const heat = (a.attack || a.rapidAttack ? -240 : 0) + (b.attack || b.rapidAttack ? -240 : 0) - (a.damage + b.damage) * 0.18;
      if (d + heat < score) { score = d + heat; best = [a, b]; }
    }
  }
  return best;
}

function livingFighters(state) {
  return state.fighters.filter(f => !f.dead && !f.hidden && f.stocks > 0);
}

function isSpectating(state) {
  const hero = state.fighters.find(f => f.human);
  return !!hero && (hero.dead || hero.stocks <= 0);
}

function moveTargetThroughDeadZone(target, desired, viewW, viewH, spectator) {
  const deadX = Math.min(spectator ? 520 : 240, viewW * (spectator ? 0.14 : 0.14));
  const deadY = Math.min(spectator ? 360 : 145, viewH * (spectator ? 0.14 : 0.12));
  if (desired.x < target.x - deadX) target.x = desired.x + deadX;
  else if (desired.x > target.x + deadX) target.x = desired.x - deadX;
  if (desired.y < target.y - deadY) target.y = desired.y + deadY;
  else if (desired.y > target.y + deadY) target.y = desired.y - deadY;
}

function chooseZoom(w, h, fighters, spectator, spread) {
  const portrait = h > w * 1.25;
  const mobile = w < 820 || h < 560;
  const base = spectator ? (portrait ? 0.38 : mobile ? 0.43 : 0.52) : (portrait ? 0.56 : mobile ? 0.62 : 0.82);
  const countPenalty = Math.min(spectator ? 0.1 : 0.04, Math.max(0, fighters - 4) * 0.01);
  const spreadPenalty = spectator ? Math.min(0.11, Math.max(0, spread - 360) * 0.00016) : 0;
  return Math.max(0.42, base - countPenalty - spreadPenalty);
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
