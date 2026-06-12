/**
 * B"H
 * Fight momentum.
 *
 * Chapter 117: the bot feels the last few seconds as winning, losing, or storm.
 * This is not mathematics pretending to be a soul; it is a small pressure wind
 * that pushes aggression or evasive respect like a real player’s gut.
 */
export function updateFightMomentum(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.fightMomentum ||= { value: 0, lastBotDamage: bot.damage || 0, lastTargetDamage: world.target.damage || 0 };
  const m = bot.aiMind.fightMomentum;
  const dealt = Math.max(0, world.target.damage - m.lastTargetDamage);
  const taken = Math.max(0, (bot.damage || 0) - m.lastBotDamage);
  m.value = clamp(m.value * 0.985 + dealt * 4.4 - taken * 4.8, -100, 100);
  m.lastBotDamage = bot.damage || 0;
  m.lastTargetDamage = world.target.damage || 0;
  return { value: m.value, winning: m.value > 18, losing: m.value < -18, storm: Math.abs(m.value) > 55 };
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
