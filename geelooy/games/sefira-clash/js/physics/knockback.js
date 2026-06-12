/**
 * B"H
 * Smash-style launch math with exact joystick-vector authority.
 *
 * Chapter 281: the launch direction is now the vector itself, not a side sign
 * multiplied by a canned angle. If the thumb points northeast, the target flies
 * northeast. If it points straight up, the target rises like a spark.
 */
export function applyKnockback(target, source, attack, weapon) {
  const percent = Math.max(0, target.damage);
  const baseKnock = (attack.knock || 8) + (weapon?.knock || 0);
  const launch = launchScale(percent, attack);
  const mass = Math.max(0.6, target.stats.mass || 1);
  const force = baseKnock * launch / mass;
  const aim = normalizedAim(attack.aim, source, target);
  target.vx = aim.x * force;
  target.vy = aim.y * force;
  target.stun = stunFor(force, percent, attack);
  applyMoveSpecificRules(target, force, attack, aim);
}

export function launchScale(percent, attack = {}) {
  const lowResist = percent < 35 ? 0.24 + percent * 0.012 : 0.66;
  const midGrowth = Math.max(0, percent - 35) * 0.017;
  const highGrowth = Math.max(0, percent - 95) ** 1.22 * 0.0065;
  const fullChargeBonus = attack.fullCharge ? Math.min(1.15, percent * 0.0065) : 0;
  const rapidPenalty = attack.rapid ? 0.48 : 1;
  return Math.max(0.18, (lowResist + midGrowth + highGrowth + fullChargeBonus) * rapidPenalty);
}

function normalizedAim(aim, source, target) {
  const fallbackX = Math.sign(source.face || target.x - source.x || 1) || 1;
  const x = Number.isFinite(aim?.x) ? aim.x : fallbackX;
  const y = Number.isFinite(aim?.y) ? aim.y : -0.2;
  const mag = Math.hypot(x, y) || 1;
  return { x: x / mag, y: y / mag };
}

function stunFor(force, percent, attack) {
  const rapid = attack.rapid ? 0.65 : 1;
  return Math.min(78, (8 + force * 1.6 + percent * 0.05) * rapid);
}

function applyMoveSpecificRules(target, force, attack, aim) {
  if (attack.id === 'sweep') target.vy = Math.max(target.vy, -1.5);
  if (attack.id === 'meteorKick') target.vy = Math.max(target.vy, Math.abs(force) * 0.92);
  if (aim.y > 0.42 && attack.id !== 'sweep') target.vy = Math.max(target.vy, Math.abs(force) * Math.max(0.48, aim.y));
  if (aim.y < -0.42) target.vy = Math.min(target.vy, -Math.abs(force) * Math.max(0.62, Math.abs(aim.y)));
  if (target.damage < 40 && attack.fullCharge) {
    target.vx *= 0.62;
    target.vy *= 0.62;
  }
}
