/**
 * B"H — Weapon trails remember fast motion for a few frames. A sword or axe
 * does not merely appear; it leaves a fading kav of judgment and light.
 */
export function addWeaponTrails(state) {
  for (const f of state.fighters) {
    if (!f.heldWeapon || !f.attack) continue;
    const w = f.heldWeapon;
    state.particles.push({
      x: w.x + f.face * w.range * .55,
      y: w.y - 4,
      vx: -f.face * 1.4,
      vy: -.25,
      life: 18,
      color: w.color
    });
  }
}
