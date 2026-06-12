/**
 * B"H
 * Downward landing shockwave.
 *
 * Chapter 127: a true slam needs falling force. We remember the pre-landing
 * velocity so only intentional hard landings with down held split the ground.
 */
export function resolveLandingShockwaves(state) {
  for (const f of state.fighters) {
    if (!shouldShockwave(f)) continue;
    f.slamCooldown = 34;
    blastAround(state, f);
  }
  for (const f of state.fighters) f.slamCooldown = Math.max(0, (f.slamCooldown || 0) - 1);
}

function shouldShockwave(f) {
  const hardLanding = f.grounded && !f.wasGrounded && (f.preLandingVy || 0) > 9;
  return hardLanding && !!f.lastInput?.down && (f.slamCooldown || 0) === 0;
}

function blastAround(state, source) {
  const radius = 265;
  for (const target of state.fighters) {
    if (target === source || target.dead) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.hypot(dx, dy * 0.7);
    if (dist > radius) continue;
    const power = 1 - dist / radius;
    const side = Math.sign(dx) || source.face || 1;
    target.damage += Math.round(10 + power * 16);
    target.vx += side * (13 + power * 22);
    target.vy -= 10 + power * 16;
    target.stun = Math.max(target.stun || 0, 20 + power * 20);
  }
  state.hitstop = Math.max(state.hitstop || 0, 6);
  state.events.push({ type: 'hit', x: source.x, y: source.y - 22, color: '#ffef9d', letter: 'רעש', damage: 22, force: 28, side: source.face || 1, shockwave: true });
}
