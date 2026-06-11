/**
 * B"H
 * Smash-style launch math.
 *
 * Chapter 7: damage becomes distance. The Awtsmoos writes force through angle,
 * percent, weapon mass, and fighter weight, so a fresh body merely stumbles
 * while a wounded body becomes a comet tearing across the heichal.
 */
export function applyKnockback(target, source, attack, weapon) {
  const percent = Math.max(0, target.damage);
  const growth = 1 + percent * 0.018 + Math.min(1.6, percent * percent * 0.000035);
  const weaponKnock = weapon?.knock || 0;
  const mass = Math.max(0.55, target.stats.mass || 1);
  const force = ((attack.knock || 8) + weaponKnock) * growth / mass;
  const side = Math.sign(target.x - source.x) || source.face || 1;
  const angle = attack.angle ?? -0.48;
  target.vx = side * Math.cos(angle) * force;
  target.vy = Math.sin(angle) * force;
  target.stun = Math.min(70, 10 + force * 1.8 + percent * 0.08);
  if (attack.id === 'sweep') target.vy = Math.max(target.vy, -1.5);
  if (attack.id === 'meteorKick') target.vy = Math.abs(force) * 0.92;
}
