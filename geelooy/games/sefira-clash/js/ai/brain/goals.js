/**
 * B"H
 * Bot goal placement.
 *
 * Chapter 85: every desire receives a destination, even if a sensor is missing
 * a predicted point for one frame. The bot must never stop fighting because a
 * helper object was undefined.
 */
export function goalX(bot, w, intent) {
  const predicted = w.predicted || w.target || { x: bot.x + (w.dx || 0), y: bot.y + (w.dy || 0) };
  if (intent === 'recover') return w.edge?.center ?? bot.x;
  if (intent === 'denyRecovery') return predicted.x;
  if (intent === 'ledgeTrap') return w.recovery?.ledgeX ?? predicted.x;
  if (intent === 'powerup') return w.powerup.x;
  if (intent === 'perch') return w.territory.perch.x;
  if (intent === 'weapon') return w.weapon.x;
  if (intent === 'separate') return bot.x + separationSide(bot, w) * 220;
  if (intent === 'unstick') return bot.x + (bot.ai.laneBias || 1) * 320;
  if (intent === 'retreat' || intent === 'bait') return bot.x - Math.sign(w.dx || 1) * 190;
  if (intent === 'brawl') return predicted.x - Math.sign(w.dx || 1) * 54;
  if (intent === 'pressure' || intent === 'punish') return predicted.x - Math.sign(w.dx || 1) * 72;
  if (intent === 'edgeguard') return predicted.x - Math.sign(w.dx || 1) * 65;
  return predicted.x - Math.sign(w.dx || 1) * 95;
}

export function steer(bot, goal, intent, crowdPush = 0) {
  const dx = goal - bot.x;
  const base = Math.abs(dx) < 14 ? 0 : Math.sign(dx);
  const crowd = intent === 'brawl' || intent === 'pressure' ? crowdPush * 0.18 : crowdPush * 0.5;
  const blended = Math.max(-1, Math.min(1, base + crowd));
  const fast = ['punish', 'recover', 'unstick', 'perch', 'denyRecovery', 'brawl', 'pressure'].includes(intent);
  return blended * (fast ? 1 : intent === 'bait' ? 0.5 : 0.86);
}

function separationSide(bot, w) {
  return Math.sign(w.crowdPush || -w.dx || bot.ai.laneBias || 1);
}
