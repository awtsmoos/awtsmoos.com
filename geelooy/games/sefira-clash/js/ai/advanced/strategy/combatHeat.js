import { updateHuntClock } from './huntClock.js';

/**
 * B"H
 * Combat heat and hunt clock.
 *
 * Chapter 40: heat becomes a real clock. No-damage silence, distance, edge
 * pressure, and personality feed a deterministic fuse that commands pursuit
 * before the arena falls asleep.
 */
export function updateCombatHeat(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.combatHeat ||= freshHeat(world.target.damage);
  const h = bot.aiMind.combatHeat;
  updateDamageClock(h, world);
  const distance = distanceTo(bot, world.target);
  h.heat = clamp(baseHeat(bot, world, h, distance), 0, 100);
  h.desperate = h.noDamageFrames > 760;
  h.forceEngage = h.noDamageFrames > 420 || (distance > 680 && h.noDamageFrames > 180);
  h.killMode = world.target.damage >= 86 || world.koPressure?.lethal;
  h.comboMode = (bot.aiMind.comboMomentum?.active || false) || h.recentHitFrames > 0;
  h.hunt = updateHuntClock(bot, world, h);
  return { ...h };
}

function updateDamageClock(h, world) {
  const dealt = world.target.damage > h.lastTargetDamage + 0.5;
  h.noDamageFrames = dealt ? 0 : h.noDamageFrames + 1;
  h.recentHitFrames = dealt ? 150 : Math.max(0, h.recentHitFrames - 1);
  h.lastTargetDamage = world.target.damage;
}

function baseHeat(bot, world, h, distance) {
  const personality = bot.personality || {};
  const aggression = personality.aggression || 1;
  return 32 + h.noDamageFrames * 0.06 * aggression + world.target.damage * 0.28 - distance * 0.018 + (world.edgePressure?.score || 0) * 16 - bot.damage * 0.07;
}

function distanceTo(bot, target) {
  return Math.hypot(target.x - bot.x, (target.y - bot.y) * 0.45);
}

function freshHeat(targetDamage) {
  return { heat: 32, noDamageFrames: 0, lastTargetDamage: targetDamage || 0, recentHitFrames: 0, desperate: false, forceEngage: false, killMode: false, comboMode: false, hunt: null };
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
