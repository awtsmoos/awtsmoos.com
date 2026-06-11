import { weightIntent } from './personality.js';

/**
 * B"H
 * Bot utility scorer.
 *
 * Chapter 67: utility now understands exile. A recovery route can be hunted,
 * a no-jump opponent can be denied, and high ground still calls to fighters
 * who would otherwise run forever through the lower world.
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
    recover: w.edge.off || bot.y > w.floor.y + 110 ? 999 : 0,
    denyRecovery: w.recovery?.vulnerable ? 820 - w.dist * 0.16 : 0,
    ledgeTrap: w.recovery?.offstage && !w.recovery?.vulnerable ? 620 - Math.abs(bot.x - w.recovery.ledgeX) * 0.22 : 0,
    unstick: bot.ai.stuck > 34 ? 930 : 0,
    separate: w.touching > 0 || Math.abs(w.crowdPush) > 0.55 ? 900 : 0,
    powerup: w.powerup ? scorePowerup(bot, w) : 0,
    perch: w.territory?.wantsPerch ? Math.min(560, w.territory.perch.score * 0.62) : 0,
    weapon: w.weapon && !bot.heldWeapon ? 520 - Math.abs(w.weapon.x - bot.x) * 0.13 : 0,
    edgeguard: !w.edge.off && w.target.y > w.floor.y + 55 ? 650 - w.dist * 0.22 : 0,
    punish: w.whiff ? 760 * w.hitChance - w.dist * 0.55 : 0,
    retreat: w.crowded > 1 || w.dist < 60 ? 440 : 0,
    pressure: w.dist < 220 ? 590 * w.hitChance - w.dist * 0.45 + (w.territory?.highGround ? 80 : 0) : 0,
    bait: w.dist < 310 && w.hitChance < 0.45 ? 360 : 0,
    approach: 180
  };
}

function scorePowerup(bot, w) {
  const needHeal = bot.damage > 55 && w.powerup.id === 'chesedHeal';
  const useful = needHeal || w.powerup.id !== 'chesedHeal';
  return useful ? 610 - Math.abs(w.powerup.x - bot.x) * 0.11 : 80;
}
