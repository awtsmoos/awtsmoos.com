/**
 * B"H
 * Hunger system.
 *
 * Chapter 115: the bot receives a human ache: I want to hit him. Hunger rises
 * when ignored, far, whiffing, or peaceful; it falls when contact is made.
 */
export function updateHunger(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.hunger ||= { value: 42, hitClock: 0, frames: 0 };
  const h = bot.aiMind.hunger;
  h.frames++;
  const hit = world.target.damage > (h.lastTargetDamage ?? world.target.damage);
  if (hit) h.value -= 24;
  else h.value += hungerGain(bot, world);
  h.hitClock = hit ? 0 : h.hitClock + 1;
  h.lastTargetDamage = world.target.damage;
  h.value = clamp(h.value, 0, 100);
  return { value: h.value, hungry: h.value > 62, starving: h.value > 82, hitClock: h.hitClock };
}

function hungerGain(bot, world) {
  const d = Math.hypot(world.target.x - bot.x, (world.target.y - bot.y) * 0.45);
  let gain = 0.18;
  if (d > 520) gain += 0.08;
  if (world.combatHeat?.forceEngage) gain += 0.28;
  if (bot.aiMind?.memory && Object.keys(bot.aiMind.memory.whiffs || {}).length) gain += 0.05;
  if (world.target.damage > 80) gain += 0.08;
  return gain;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
