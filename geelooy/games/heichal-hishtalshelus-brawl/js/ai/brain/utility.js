import { weightIntent } from './personality.js';

/**
 * B"H
 * Bot utility scorer.
 *
 * Chapter 77: recovery is no longer a mood. It is a true emergency only when
 * the bot itself is outside the stone or deeply below it. This stops the bots
 * from jumping around doing nothing while still saving them from real exile.
 */
export function chooseIntent(bot, w) {
  const scores = rawScores(bot, w);
  let best = 'approach';
  let bestScore = weightIntent(bot, best, scores[best]);
  for (const key in scores) {
    const weighted = weightIntent(bot, key, scores[key]);
    if (weighted > bestScore) { best = key; bestScore = weighted; }
  }
  bot.ai.mode = best;
  bot.ai.lastScore = Math.round(bestScore);
  return best;
}

function rawScores(bot, w) {
  return {
    recover: needsSelfRecovery(bot, w.floor) ? 999 : 0,
    denyRecovery: w.recovery?.vulnerable ? 820 - w.dist * 0.16 : 0,
    ledgeTrap: w.recovery?.offstage && !w.recovery?.vulnerable ? 620 - Math.abs(bot.x - w.recovery.ledgeX) * 0.22 : 0,
    unstick: bot.ai.stuck > 48 ? 850 : 0,
    separate: w.touching > 0 || Math.abs(w.crowdPush) > 0.65 ? 780 : 0,
    powerup: w.powerup ? scorePowerup(bot, w) : 0,
    perch: w.territory?.wantsPerch ? Math.min(510, w.territory.perch.score * 0.56) : 0,
    weapon: w.weapon && !bot.heldWeapon ? 500 - Math.abs(w.weapon.x - bot.x) * 0.13 : 0,
    edgeguard: !w.edge.off && w.target.y > w.floor.y + 55 ? 560 - w.dist * 0.22 : 0,
    punish: w.whiff ? 760 * w.hitChance - w.dist * 0.55 : 0,
    retreat: w.crowded > 1 || w.dist < 60 ? 430 : 0,
    pressure: w.dist < 240 ? 620 * w.hitChance - w.dist * 0.35 + (w.territory?.highGround ? 80 : 0) : 0,
    bait: w.dist < 310 && w.hitChance < 0.45 ? 320 : 0,
    approach: 210
  };
}

function needsSelfRecovery(bot, floor) {
  if (bot.grounded) return false;
  const outside = bot.x < floor.x - 120 || bot.x > floor.x + floor.w + 120;
  const deepBelow = bot.y > floor.y + 240;
  return outside || deepBelow;
}

function scorePowerup(bot, w) {
  const needHeal = bot.damage > 55 && w.powerup.id === 'chesedHeal';
  const useful = needHeal || w.powerup.id !== 'chesedHeal';
  return useful ? 610 - Math.abs(w.powerup.x - bot.x) * 0.11 : 80;
}
