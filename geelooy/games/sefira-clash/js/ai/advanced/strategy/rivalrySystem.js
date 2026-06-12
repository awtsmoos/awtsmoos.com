/**
 * B"H
 * Rivalry memory.
 *
 * Chapter 43: damage writes names into the bot's heart. Not forever, not with
 * hatred, but as tactical memory: who hurt me, who is weak, who must be hunted.
 */
export function updateRivalry(bot, world) {
  bot.aiMind ||= {};
  const rival = bot.aiMind.rivalry ||= { id: null, heat: 0, lastDamage: bot.damage || 0 };
  const hurt = (bot.damage || 0) - (rival.lastDamage || 0);
  if (hurt > 0.5 && world.target) {
    rival.id = world.target.id;
    rival.heat = Math.min(100, rival.heat + hurt * 2.4 + 12);
  } else rival.heat = Math.max(0, rival.heat - 0.35);
  rival.lastDamage = bot.damage || 0;
  return rival;
}

export function rivalryTargetBonus(bot, target) {
  const rival = bot.aiMind?.rivalry;
  if (!rival || rival.id !== target.id) return 0;
  return Math.min(140, rival.heat * 1.25);
}
