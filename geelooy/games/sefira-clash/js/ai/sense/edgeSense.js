/**
 * B"H
 * Edge sense with future prediction.
 *
 * Chapter 190: the edge is not observed at the last pixel. The bot imagines
 * its next several positions and treats cliff-suicide as forbidden prophecy.
 */
export function edgeSense(bot, platform, input = { x: 0 }) {
  const safe = safeRange(platform);
  const future = bot.x + (bot.vx || 0) * 10 + (input.x || 0) * 55;
  const later = bot.x + (bot.vx || 0) * 18 + (input.x || 0) * 95;
  const danger = bot.x < safe.left || bot.x > safe.right || future < safe.left || future > safe.right || later < safe.left || later > safe.right;
  return { ...safe, danger, inward: Math.sign(safe.center - bot.x) || 1, future, later };
}

export function safeRange(p) {
  const margin = Math.min(220, Math.max(120, p.w * 0.16));
  return { left: p.x + margin, right: p.x + p.w - margin, center: p.x + p.w / 2 };
}
