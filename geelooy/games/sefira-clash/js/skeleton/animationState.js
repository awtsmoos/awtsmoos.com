/**
 * B"H
 * Fighter animation state classifier.
 *
 * Chapter 243: the body is no longer one pose with different coordinates.
 * Squat, takeoff, rise, apex, fall, fast-fall, ledge, shield, charge, hitstun,
 * and landing each receive a distinct name and intensity, so every frame can
 * look like a tiny sentence in the ongoing novel of the Awtsmoos.
 */
export function animationState(f) {
  const vy = f.vy || 0;
  const speed = Math.abs(f.vx || 0);
  const charge = f.chargeGlow || 0;
  const grounded = !!f.grounded;
  const kind = chooseKind(f, vy, speed, charge, grounded);
  const squash = grounded ? landingSquash(f) + (kind === 'squat' ? 0.18 : 0) : -Math.min(0.16, Math.abs(vy) * 0.006);
  return {
    kind,
    speed,
    charge,
    squash,
    stretch: Math.max(0, -squash),
    crouch: kind === 'squat' || kind === 'landing' ? 1 : 0,
    airborne: !grounded,
    rise: vy < -1,
    fall: vy > 1,
    apex: !grounded && Math.abs(vy) <= 1.4,
    attack: f.attack?.id || ''
  };
}

function chooseKind(f, vy, speed, charge, grounded) {
  if (f.grabbedBy) return 'grabbed';
  if (f.ledgeHang) return 'ledgeHang';
  if (f.stun > 0) return 'hitstun';
  if (f.blocking) return 'shield';
  if (f.attack) return `attack:${f.attack.id}`;
  if (charge > 0.08) return charge > 0.92 ? 'maxCharge' : 'charge';
  if (f.landingLag > 0) return 'landing';
  if (grounded && f.lastInput?.y > 0.45) return 'squat';
  if (!grounded && vy < -4) return 'rise';
  if (!grounded && Math.abs(vy) <= 1.4) return 'apex';
  if (!grounded && f.fastFalling) return 'fastFall';
  if (!grounded && vy > 1) return 'fall';
  if (speed > 1.2) return 'run';
  return 'idle';
}

function landingSquash(f) {
  const impact = Math.max(0, (f.preLandingVy || 0) - 8);
  return Math.min(0.22, impact * 0.016);
}
