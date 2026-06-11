/**
 * B"H
 * Bot goal placement.
 *
 * Chapter 68: the bot now has a ledge mind. It can stand at the route home,
 * deny the faller, claim perches, recover to center, and avoid crowd knots.
 */
export function goalX(bot, w, intent) {
  if (intent === 'recover') return w.edge.center;
  if (intent === 'denyRecovery') return w.predicted.x;
  if (intent === 'ledgeTrap') return w.recovery.ledgeX;
  if (intent === 'powerup') return w.powerup.x;
  if (intent === 'perch') return w.territory.perch.x;
  if (intent === 'weapon') return w.weapon.x;
  if (intent === 'separate') return bot.x + separationSide(bot, w) * 280;
  if (intent === 'unstick') return bot.x + (bot.ai.laneBias || 1) * 360;
  if (intent === 'retreat' || intent === 'bait') return bot.x - Math.sign(w.dx || 1) * 215;
  if (intent === 'edgeguard') return w.predicted.x - Math.sign(w.dx || 1) * 75;
  if (intent === 'pressure' || intent === 'punish') return w.predicted.x - Math.sign(w.dx || 1) * 96;
  return w.predicted.x - Math.sign(w.dx || 1) * 140;
}

export function steer(bot, goal, intent, crowdPush = 0) {
  const dx = goal - bot.x;
  const base = Math.abs(dx) < 22 ? 0 : Math.sign(dx);
  const blended = Math.max(-1, Math.min(1, base + crowdPush * 0.55));
  const speed = ['punish', 'recover', 'unstick', 'perch', 'denyRecovery'].includes(intent) ? 1 : intent === 'bait' ? 0.5 : 0.82;
  return blended * speed;
}

function separationSide(bot, w) {
  return Math.sign(w.crowdPush || -w.dx || bot.ai.laneBias || 1);
}
