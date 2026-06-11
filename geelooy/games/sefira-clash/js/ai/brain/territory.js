/**
 * B"H
 * Territory and power-position sensor.
 *
 * Chapter 52: high places become meaningful. The bot sees whether it stands
 * above the enemy, whether a nearby platform is a throne, and whether claiming
 * it is worth more than blind pursuit across the arena.
 */
export function territorySense(bot, target, floor, platforms) {
  const highGround = bot.y + 90 < target.y ? 1 : 0;
  const perch = bestPerch(bot, target, platforms);
  return { highGround, perch, wantsPerch: !!perch && !highGround };
}

function bestPerch(bot, target, platforms) {
  let best = null;
  let bestScore = 0;
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    if (p.w < 220 || p.y > bot.y + 180) continue;
    const center = p.x + p.w / 2;
    const nearTarget = Math.max(0, 900 - Math.abs(center - target.x));
    const aboveTarget = Math.max(0, target.y - p.y);
    const reachable = Math.max(0, 700 - Math.abs(center - bot.x) - Math.abs(p.y - bot.y) * 0.45);
    const score = nearTarget * 0.4 + aboveTarget * 0.7 + reachable * 0.55;
    if (score > bestScore) { bestScore = score; best = { x: center, y: p.y, score }; }
  }
  return best;
}
