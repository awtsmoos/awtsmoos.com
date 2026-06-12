/**
 * B"H
 * Smash-style launch math with attack-aim authority.
 *
 * Chapter 233: the direction of the blow is no longer guessed from where the
 * target happened to stand. The attack itself carries the facing/aim chosen at
 * release, so a right punch launches right, an up strike rises, and a down
 * strike spikes by kavannah.
 */
export function applyKnockback(target, source, attack, weapon) {
  const percent = Math.max(0, target.damage);
  const baseKnock = (attack.knock || 8) + (weapon?.knock || 0);
  const launch = launchScale(percent, attack);
  const mass = Math.max(0.6, target.stats.mass || 1);
  const force = baseKnock * launch / mass;
  const aim = attack.aim || { x: source.face || 1, y: 0 };
  const side = Math.sign(aim.x || source.face || target.x - source.x || 1) || 1;
  const angle = attack.angle ?? angleFromAim(aim);
  target.vx = side * Math.cos(angle) * force;
  target.vy = Math.sin(angle) * force;
  target.stun = stunFor(force, percent, attack);
  applyMoveSpecificRules(target, force, attack);
}

/**
 * Fresh targets resist launch hard; wounded targets scale explosively.
 * @param {number} percent Current accumulated damage after the hit.
 * @param {object} attack Active attack state.
 * @returns {number} Knockback multiplier.
 */
export function launchScale(percent, attack = {}) {
  const lowResist = percent < 35 ? 0.24 + percent * 0.012 : 0.66;
  const midGrowth = Math.max(0, percent - 35) * 0.017;
  const highGrowth = Math.max(0, percent - 95) ** 1.22 * 0.0065;
  const fullChargeBonus = attack.fullCharge ? Math.min(1.15, percent * 0.0065) : 0;
  const rapidPenalty = attack.rapid ? 0.48 : 1;
  return Math.max(0.18, (lowResist + midGrowth + highGrowth + fullChargeBonus) * rapidPenalty);
}

function angleFromAim(aim) {
  if (aim?.y < 0) return -1.05;
  if (aim?.y > 0) return 0.82;
  return -0.2;
}

function stunFor(force, percent, attack) {
  const rapid = attack.rapid ? 0.65 : 1;
  return Math.min(78, (8 + force * 1.6 + percent * 0.05) * rapid);
}

function applyMoveSpecificRules(target, force, attack) {
  if (attack.id === 'sweep') target.vy = Math.max(target.vy, -1.5);
  if (attack.id === 'meteorKick') target.vy = Math.abs(force) * 0.92;
  if (attack.aim?.y > 0 && attack.id !== 'sweep') target.vy = Math.max(target.vy, Math.abs(force) * 0.48);
  if (attack.aim?.y < 0) target.vy = Math.min(target.vy, -Math.abs(force) * 0.62);
  if (target.damage < 40 && attack.fullCharge) {
    target.vx *= 0.62;
    target.vy *= 0.62;
  }
}
