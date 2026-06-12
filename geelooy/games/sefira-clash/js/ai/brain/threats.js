/**
 * B"H
 * Threat target selection with anti-dither commitment.
 *
 * Chapter 261: when two enemies stand around a bot, the bot must not freeze in
 * the middle like a torn parchment. Target scoring now favors committed rivals,
 * reachable enemies, and enemies not hidden behind walls.
 */
export function chooseTarget(bot, fighters, map = null) {
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    if (f === bot || f.dead) continue;
    const score = threatScore(bot, f, map);
    if (score > bestScore) { best = f; bestScore = score; }
  }
  return best;
}

export function threatScore(bot, f, map = null) {
  const dx = Math.abs(f.x - bot.x);
  const dy = Math.abs(f.y - bot.y);
  const near = Math.max(0, 760 - dx - dy * 0.55);
  const armed = f.heldWeapon ? 180 : 0;
  const buffed = f.buffs && Object.keys(f.buffs).length ? 140 : 0;
  const attacking = f.attack ? 120 : 0;
  const woundedKillable = f.damage * 0.8;
  const rival = bot.ai?.lastAttacker === f.id ? 280 : 0;
  const committed = bot.ai?.targetId === f.id ? 240 : 0;
  const sameLane = dy < 135 ? 120 : 0;
  const wallPenalty = map && blockedByWall(bot, f, map) ? -420 : 0;
  return near + armed + buffed + attacking + woundedKillable + rival + committed + sameLane + wallPenalty;
}

function blockedByWall(bot, f, map) {
  const walls = map.walls || [];
  for (const wall of walls) {
    if (!between(bot.x, f.x, wall.x, wall.x + wall.w)) continue;
    const top = Math.min(bot.y - 170, f.y - 170);
    const bottom = Math.max(bot.y + 8, f.y + 8);
    if (bottom > wall.y && top < wall.y + wall.h) return true;
  }
  return false;
}

function between(a, b, left, right) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return right > min && left < max;
}
