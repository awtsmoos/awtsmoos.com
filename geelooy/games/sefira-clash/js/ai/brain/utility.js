import { weightIntent } from './personality.js';

/**
 * B"H
 * Bot utility scorer, aggression repair.
 *
 * Chapter 82: the bots wandered because desire was scattered across toys,
 * ledges, and perches. Now the first law is fight when close, punish when the
 * enemy errs, and only seek ornaments when combat is not immediately present.
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
  const close = w.dist < 230;
  const veryClose = w.dist < 130;
  return {
    recover: needsSelfRecovery(bot, w.floor) ? 999 : 0,
    punish: w.whiff && w.dist < 320 ? 920 - w.dist * 0.7 : 0,
    pressure: close ? 760 - w.dist * 0.9 + w.hitChance * 180 : 0,
    brawl: veryClose ? 840 - w.dist * 1.4 : 0,
    denyRecovery: w.recovery?.vulnerable ? 740 - w.dist * 0.16 : 0,
    separate: w.touching > 1 || Math.abs(w.crowdPush) > 0.8 ? 520 : 0,
    weapon: !close && w.weapon && !bot.heldWeapon ? 430 - Math.abs(w.weapon.x - bot.x) * 0.11 : 0,
    powerup: !close && w.powerup ? scorePowerup(bot, w) : 0,
    ledgeTrap: !close && w.recovery?.offstage && !w.recovery?.vulnerable ? 360 : 0,
    perch: !close && w.territory?.wantsPerch ? Math.min(360, w.territory.perch.score * 0.36) : 0,
    unstick: bot.ai.stuck > 54 ? 650 : 0,
    retreat: bot.damage > 130 && veryClose ? 500 : 0,
    bait: w.dist < 260 && w.hitChance < 0.35 ? 260 : 0,
    approach: 260
  };
}

function needsSelfRecovery(bot, floor) {
  if (bot.grounded) return false;
  const outside = bot.x < floor.x - 120 || bot.x > floor.x + floor.w + 120;
  const deepBelow = bot.y > floor.y + 240;
  return outside || deepBelow;
}

function scorePowerup(bot, w) {
  const needHeal = bot.damage > 65 && w.powerup.id === 'chesedHeal';
  const useful = needHeal || w.powerup.id !== 'chesedHeal';
  return useful ? 420 - Math.abs(w.powerup.x - bot.x) * 0.1 : 40;
}
