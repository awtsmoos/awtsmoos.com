/**
 * B"H
 * Bot memory keeper with anti-dither and route commitment.
 *
 * Chapter 150: the bot remembers more than x. It remembers whether it is
 * trembling, reversing, failing a route, and which direction it has committed
 * to for a few breaths. Memory becomes dignity; dignity becomes pursuit.
 */
export function prepareMemory(bot) {
  bot.ai ||= {};
  bot.ai.clock = (bot.ai.clock || 0) + 1;
  bot.ai.lastX ??= bot.x;
  bot.ai.lastY ??= bot.y;
  bot.ai.lastVX ??= bot.vx || 0;
  bot.ai.stuck = movementStuck(bot) ? (bot.ai.stuck || 0) + 1 : 0;
  bot.ai.dither = reversed(bot) ? (bot.ai.dither || 0) + 1 : Math.max(0, (bot.ai.dither || 0) - 1);
  bot.ai.routeFail = routeFailing(bot) ? (bot.ai.routeFail || 0) + 1 : Math.max(0, (bot.ai.routeFail || 0) - 2);
  bot.ai.lastX = bot.x;
  bot.ai.lastY = bot.y;
  bot.ai.lastVX = bot.vx || 0;
  bot.ai.cooldown = Math.max(0, (bot.ai.cooldown || 0) - 1);
  bot.ai.hold = Math.max(0, bot.ai.hold || 0);
  bot.ai.laneBias ??= bot.id?.length % 2 ? 1 : -1;
  if (bot.ai.stuck > 42 || bot.ai.dither > 18 || bot.ai.routeFail > 50) bot.ai.laneBias *= -1;
}

function movementStuck(bot) {
  return Math.abs(bot.x - bot.ai.lastX) < 0.32 && Math.abs(bot.y - bot.ai.lastY) < 0.5 && Math.abs(bot.vx || 0) < 1.4;
}

function reversed(bot) {
  const vx = bot.vx || 0;
  return Math.abs(vx) > 1.2 && Math.abs(bot.ai.lastVX) > 1.2 && Math.sign(vx) !== Math.sign(bot.ai.lastVX);
}

function routeFailing(bot) {
  return bot.ai.mode && ['approach', 'pressure', 'perch', 'weapon', 'powerup'].includes(bot.ai.mode) && (bot.ai.stuck || 0) > 18;
}
