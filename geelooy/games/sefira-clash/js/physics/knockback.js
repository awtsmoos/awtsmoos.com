/**
 * B"H
 * Smash-style launch math with rapid-fire equality.
 *
 * Chapter 247: the Awtsmoos reveals the law hidden inside the sparks: a rapid
 * hit is still a hit. It may arrive in a swarm, but each spark carries normal
 * damage influence, normal launch growth, normal hit reaction, and no secret
 * jail-chain that freezes the victim's will.
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
  target.stun = stunFor(force, percent, attack, source);
  if (attack.rapid) markRapidMobility(target);
  applyMoveSpecificRules(target, force, attack, aim);
}

export function launchScale(percent, attack = {}) {
  const lowResist = percent < 35 ? 0.24 + percent * 0.012 : 0.66;
  const midGrowth = Math.max(0, percent - 35) * 0.017;
  const highGrowth = Math.max(0, percent - 95) ** 1.22 * 0.0065;
  const fullChargeBonus = attack.fullCharge ? Math.min(1.15, percent * 0.0065) : 0;
  return Math.max(0.18, lowResist + midGrowth + highGrowth + fullChargeBonus);
}

function normalizedAim(aim, source, target) {
  const fallbackX = Math.sign(source.face || target.x - source.x || 1) || 1;
  const x = Number.isFinite(aim?.x) ? aim.x : fallbackX;
  const y = Number.isFinite(aim?.y) ? aim.y : -0.2;
  const mag = Math.hypot(x, y) || 1;
  return { x: x / mag, y: y / mag };
}

function stunFor(force, percent, attack, source) {
  const rage = source?.buffs?.rageScroll ? 1.18 : 1;
  return Math.min(86, (8 + force * 1.6 + percent * 0.05) * rage);
}

function markRapidMobility(target) {
  target.rapidMobilityFrames = Math.max(target.rapidMobilityFrames || 0, 16);
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
