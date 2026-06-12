/**
 * B"H
 * Bot memory keeper with anti-dither, route commitment, and edge-hover memory.
 *
 * Chapter 266: the bot remembers not merely where it was, but whether the same
 * ledge kept swallowing its courage. Slow displacement, fast direction flipping,
 * failed routes, and edge-hover all become pressure toward a forced escape.
 */
export function prepareMemory(bot) {
  bot.ai ||= {};
  bot.ai.clock = (bot.ai.clock || 0) + 1;
  bot.ai.lastX ??= bot.x;
  bot.ai.lastY ??= bot.y;
  bot.ai.lastVX ??= bot.vx || 0;
  bot.ai.stuck = movementStuck(bot) ? (bot.ai.stuck || 0) + 1 : Math.max(0, (bot.ai.stuck || 0) - 2);
  bot.ai.dither = reversed(bot) ? (bot.ai.dither || 0) + 2 : Math.max(0, (bot.ai.dither || 0) - 1);
  bot.ai.routeFail = routeFailing(bot) ? (bot.ai.routeFail || 0) + 1 : Math.max(0, (bot.ai.routeFail || 0) - 2);
  bot.ai.edgeHover = edgeHovering(bot) ? (bot.ai.edgeHover || 0) + 1 : Math.max(0, (bot.ai.edgeHover || 0) - 2);
  bot.ai.zeroOutput = zeroOutput(bot) ? (bot.ai.zeroOutput || 0) + 1 : 0;
  updateTrail(bot);
  bot.ai.lastX = bot.x;
  bot.ai.lastY = bot.y;
  bot.ai.lastVX = bot.vx || 0;
  bot.ai.cooldown = Math.max(0, (bot.ai.cooldown || 0) - 1);
  bot.ai.hold = Math.max(0, bot.ai.hold || 0);
  bot.ai.laneBias ??= bot.id?.length % 2 ? 1 : -1;
  if (bot.ai.stuck > 42 || bot.ai.dither > 18 || bot.ai.routeFail > 50 || bot.ai.edgeHover > 28) bot.ai.laneBias *= -1;
}

function movementStuck(bot) {
  const moved = Math.abs(bot.x - bot.ai.lastX) + Math.abs(bot.y - bot.ai.lastY) * 0.7;
  const pushing = Math.abs(bot.ai.lastOutputX || 0) > 0.2;
  const slow = Math.abs(bot.vx || 0) < (pushing ? 2.2 : 1.2);
  return moved < 0.62 && slow;
}

function reversed(bot) {
  const vx = bot.vx || 0;
  return Math.abs(vx) > 0.9 && Math.abs(bot.ai.lastVX) > 0.9 && Math.sign(vx) !== Math.sign(bot.ai.lastVX);
}

function routeFailing(bot) {
  const active = bot.ai.mode && ['approach', 'pressure', 'perch', 'weapon', 'powerup', 'route'].includes(bot.ai.mode);
  return active && ((bot.ai.stuck || 0) > 18 || (bot.ai.zeroOutput || 0) > 12);
}

function edgeHovering(bot) {
  return !!bot.grounded && Math.abs(bot.vx || 0) < 1.8 && (bot.ai.stuck || 0) > 10;
}

function zeroOutput(bot) {
  return Math.abs(bot.ai.lastOutputX || 0) < 0.08 && !bot.attack && bot.stun <= 0;
}

function updateTrail(bot) {
  bot.ai.trail ||= [];
  bot.ai.trail.push({ x: bot.x, y: bot.y, t: bot.ai.clock });
  if (bot.ai.trail.length > 16) bot.ai.trail.shift();
}
