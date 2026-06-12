import { COMBAT_TUNING } from '../data/combatTuning.js';

/**
 * B"H
 * Launch law with directional influence and rapid truth.
 *
 * Chapter 26: rapid fire loses its glue. Every hit writes new velocity like a
 * single honest strike; only stun is softened so steering and gravity remain
 * alive while the body is still thrown by force.
 */
export function applyKnockback(target, source, attack, weapon) {
  const vector = predictLaunch(target, source, attack, weapon);
  target.vx = vector.x * vector.force;
  target.vy = vector.y * vector.force;
  target.stun = stunFor(vector.force, target.damage, attack, source);
  target.launchVector = vector;
  if (attack.rapid) markRapidMobility(target);
  applyMoveSpecificRules(target, vector.force, attack, vector);
  return vector;
}

export function predictLaunch(target, source, attack = {}, weapon = null) {
  const percent = Math.max(0, target.damage || 0);
  const baseKnock = (attack.knock || 8) + (weapon?.knock || 0);
  const force = baseKnock * launchScale(percent, attack) / Math.max(0.6, target.stats?.mass || 1);
  const aim = normalizedAim(attack.aim, source, target);
  const influenced = applyDirectionalInfluence(aim, target.lastInput, attack);
  return { x: influenced.x, y: influenced.y, force, percent, killDanger: percent >= COMBAT_TUNING.launch.killDangerPercent };
}

export function launchScale(percent, attack = {}) {
  const lowResist = percent < 35 ? 0.24 + percent * 0.012 : 0.66;
  const midGrowth = Math.max(0, percent - 35) * 0.017;
  const highGrowth = Math.max(0, percent - 95) ** 1.22 * 0.0065;
  const fullChargeBonus = attack.fullCharge ? Math.min(1.15, percent * 0.0065) : 0;
  return Math.max(0.18, lowResist + midGrowth + highGrowth + fullChargeBonus);
}

function normalizedAim(aim, source, target) {
  const fallbackX = Math.sign(source?.face || target.x - source.x || 1) || 1;
  const x = Number.isFinite(aim?.x) ? aim.x : fallbackX;
  const y = Number.isFinite(aim?.y) ? aim.y : -0.2;
  const mag = Math.hypot(x, y) || 1;
  return { x: x / mag, y: y / mag };
}

function applyDirectionalInfluence(aim, input = {}, attack = {}) {
  const strength = attack.rapid ? COMBAT_TUNING.launch.rapidDiStrength : COMBAT_TUNING.launch.diStrength;
  const ix = Number(input.x || 0);
  const iy = Number(input.y || input.aimY || 0);
  const mag = Math.hypot(ix, iy);
  if (mag < 0.2) return aim;
  const mixed = { x: aim.x + (ix / mag) * strength, y: aim.y + (iy / mag) * strength };
  const outMag = Math.hypot(mixed.x, mixed.y) || 1;
  return { x: mixed.x / outMag, y: mixed.y / outMag };
}

function stunFor(force, percent, attack, source) {
  const rage = source?.buffs?.rageScroll ? 1.18 : 1;
  const raw = (8 + force * 1.6 + percent * 0.05) * rage;
  if (!attack.rapid) return Math.min(86, raw);
  return Math.min(4, raw * 0.08);
}

function markRapidMobility(target) {
  target.rapidMobilityFrames = Math.max(target.rapidMobilityFrames || 0, COMBAT_TUNING.rapid.mobilityFrames);
}

function applyMoveSpecificRules(target, force, attack, aim) {
  if (attack.id === 'sweep') target.vy = Math.max(target.vy, -1.5);
  if (attack.id === 'meteorKick') target.vy = Math.max(target.vy, Math.abs(force) * 0.92);
  if (aim.y > 0.42 && attack.id !== 'sweep') target.vy = Math.max(target.vy, Math.abs(force) * Math.max(0.48, aim.y));
  if (aim.y < -0.42) target.vy = Math.min(target.vy, -Math.abs(force) * Math.max(0.62, Math.abs(aim.y)));
  if (target.damage < 40 && attack.fullCharge) {
    target.vx *= COMBAT_TUNING.launch.lowPercentBrake;
    target.vy *= COMBAT_TUNING.launch.lowPercentBrake;
  }
}
