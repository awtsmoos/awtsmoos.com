/**
 * B"H
 * Bot memory keeper.
 *
 * Chapter 23: the bot is not allowed to forget that it is stuck. The Awtsmoos
 * engraves recent x positions into a tiny memory, so trembling beside another
 * fighter becomes evidence, and evidence becomes escape.
 */
export function prepareMemory(bot) {
  bot.ai ||= {};
  bot.ai.clock = (bot.ai.clock || 0) + 1;
  bot.ai.lastX ??= bot.x;
  bot.ai.stuck = Math.abs(bot.x - bot.ai.lastX) < 0.38 ? (bot.ai.stuck || 0) + 1 : 0;
  bot.ai.lastX = bot.x;
  bot.ai.cooldown = Math.max(0, (bot.ai.cooldown || 0) - 1);
  bot.ai.hold = Math.max(0, bot.ai.hold || 0);
  bot.ai.laneBias ??= bot.id?.length % 2 ? 1 : -1;
  if (bot.ai.stuck > 34) bot.ai.laneBias *= -1;
}
