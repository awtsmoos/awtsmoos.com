/**
 * B"H
 * Predictive targeting helper.
 *
 * Chapter 33: the bot stops chasing yesterday. It aims for where the opponent
 * is becoming, not merely where the opponent was, so approaches become
 * intercepts and whiff-punishes begin to look intentional.
 */
export function predictTarget(target, frames = 18) {
  return {
    x: target.x + (target.vx || 0) * frames,
    y: target.y + (target.vy || 0) * frames * 0.65,
    frames
  };
}

export function hitChance(bot, predicted, range) {
  const dx = Math.abs(predicted.x - bot.x);
  const dy = Math.abs(predicted.y - bot.y);
  const score = 1 - Math.max(0, dx - range) / 260 - Math.max(0, dy - 150) / 320;
  return Math.max(0, Math.min(1, score));
}
