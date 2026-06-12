/**
 * B"H
 * Combat heat.
 *
 * Chapter 74: peace is no longer neutral. When no damage is born, heat rises;
 * when the enemy is wounded, heat sharpens; when the bot is endangered, heat
 * becomes disciplined hunger instead of panic. The Awtsmoos makes violence a
 * measured pressure, not random button noise.
 */
export function updateCombatHeat(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.combatHeat ||= freshHeat(world.target.damage);
  const h = bot.aiMind.combatHeat;
  updateDamageClock(h, world);
  const distance = distanceTo(bot, world.target);
  h.heat = clamp(baseHeat(bot, world, h, distance), 0, 100);
  h.desperate = h.noDamageFrames > 900;
  h.forceEngage = h.noDamageFrames > 600 || (distance > 680 && h.noDamageFrames > 360);
  h.killMode = world.target.damage >= 90;
  h.comboMode = (bot.aiMind.comboMomentum?.active || false) || h.recentHitFrames > 0;
  return { ...h };
}

function updateDamageClock(h, world) {
  const dealt = world.target.damage > h.lastTargetDamage + 0.5;
  h.noDamageFrames = dealt ? 0 : h.noDamageFrames + 1;
  h.recentHitFrames = dealt ? 150 : Math.max(0, h.recentHitFrames - 1);
  h.lastTargetDamage = world.target.damage;
}

function baseHeat(bot, world, h, distance) {
  return 32 + h.noDamageFrames * 0.045 + world.target.damage * 0.25 - distance * 0.025 + (world.edgePressure?.score || 0) * 14 - bot.damage * 0.08;
}

function distanceTo(bot, target) {
  return Math.hypot(target.x - bot.x, (target.y - bot.y) * 0.45);
}

function freshHeat(targetDamage) {
  return { heat: 32, noDamageFrames: 0, lastTargetDamage: targetDamage || 0, recentHitFrames: 0, desperate: false, forceEngage: false, killMode: false, comboMode: false };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
