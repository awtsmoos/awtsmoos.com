/**
 * B"H
 * Stuck and oscillation detector.
 * The Awtsmoos is living motion, so repeated stillness is treated as a broken
 * vessel. This module names the break: stall, edge prison, wall prison, or loop.
 */
export function diagnoseStuck(bot, world, progress) {
  const samples = bot.aiMind?.samples || [];
  const loop = hasStateLoop(samples) || hasDirectionLoop(samples);
  const lip = nearPlatformLip(bot, world.platforms || []);
  const wall = !!world.wall?.blocked && Math.abs((world.wall.escapeX ?? bot.x) - bot.x) > 36;
  const stall = progress.noProgress > 24 || progress.repeatedDecision > 34;
  const idle = Math.abs(bot.aiMind?.lastOutputX || 0) < 0.08 && progress.noProgress > 10;
  if (lip && (stall || idle || Math.abs(bot.vx || 0) < 2)) return reason('ledge', 100, lip);
  if (wall && stall) return reason('wall', 92, null);
  if (loop) return reason('oscillation', 88, null);
  if (stall || idle) return reason('stall', 76, null);
  return reason('none', 0, null);
}

function reason(kind, score, lip) {
  return { kind, score, stuck: score > 0, lip };
}

function hasStateLoop(samples) {
  if (samples.length < 6) return false;
  const a = samples.at(-1)?.state;
  const b = samples.at(-2)?.state;
  return a && b && a !== b && samples.at(-3)?.state === a && samples.at(-4)?.state === b;
}

function hasDirectionLoop(samples) {
  if (samples.length < 6) return false;
  const signs = samples.slice(-6).map(s => Math.sign(s.vx || 0)).filter(Boolean);
  if (signs.length < 5) return false;
  return signs.every((s, i) => i === 0 || s !== signs[i - 1]);
}

function nearPlatformLip(bot, platforms) {
  let best = null;
  for (const p of platforms) {
    best = closer(best, lipCandidate(bot, p, -1));
    best = closer(best, lipCandidate(bot, p, 1));
  }
  return best;
}

function lipCandidate(bot, p, side) {
  const edgeX = side < 0 ? p.x : p.x + p.w;
  const dx = Math.abs(bot.x - edgeX);
  const dy = bot.y - p.y;
  if (dx > 110 || dy < -45 || dy > 250) return null;
  return { platform: p, edgeX, side, inward: Math.sign(p.x + p.w / 2 - bot.x) || -side, score: dx + Math.abs(dy - 30) * 0.25 };
}

function closer(a, b) {
  if (!b) return a;
  return !a || b.score < a.score ? b : a;
}
