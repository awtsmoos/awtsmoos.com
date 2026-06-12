/**
 * B"H
 * Attack aim memory with facing mirror.
 *
 * Chapter 23: the last clicked angle is a remembered star. When the fighter
 * turns, the star crosses the body like a mirror: high stays high, low stays
 * low, but forward becomes the new forward.
 */
export function rememberAttackAim(f, button, aim) {
  if (!aim || aim.mag < 0.18) return;
  f.attackAimMemory ||= {};
  f.attackAimMemory[button] = { ...aim, face: f.face || Math.sign(aim.x) || 1 };
}

export function aimForAttack(f, button, liveAim) {
  const saved = f.attackAimMemory?.[button];
  if (!saved || liveAim?.mag >= 0.18) return liveAim;
  const face = f.face || saved.face || 1;
  const flip = face === saved.face ? 1 : -1;
  return enrichAim(saved.x * flip, saved.y, saved.rawX * flip, saved.rawY, saved.mag);
}

function enrichAim(x, y, rawX, rawY, mag) {
  return { x, y, rawX, rawY, mag, angle: Math.atan2(y, x), up: y < -0.42, down: y > 0.42, side: Math.abs(x) > 0.35 };
}
