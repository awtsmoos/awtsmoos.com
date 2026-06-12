/**
 * B"H
 * Magnetic pickup pull.
 *
 * Chapter 185: the magnetic orb lets blessings lean toward the one who earned
 * it. The pull is gentle, capped, and only affects active stage-born pickups.
 */
export function applyMagneticPull(state) {
  const magnets = state.fighters.filter(f => !f.dead && !f.hidden && f.buffs?.magneticOrb);
  if (!magnets.length) return;
  for (const orb of state.powerups || []) {
    if (!orb.active || !orb.stageBorn) continue;
    const holder = nearestMagnet(magnets, orb);
    if (!holder) continue;
    const dx = holder.x - orb.x;
    const dy = holder.y - 88 - orb.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    if (d > 420) continue;
    orb.x += dx / d * 1.8;
    orb.y += dy / d * 1.2;
  }
}

function nearestMagnet(fighters, orb) {
  let best = null;
  let dist = Infinity;
  for (const f of fighters) {
    const d = Math.hypot(f.x - orb.x, f.y - 88 - orb.y);
    if (d < dist) { best = f; dist = d; }
  }
  return best;
}
