/**
 * B"H
 * Human intent chooser.
 *
 * Chapter 124: every few frames, the bot says one sentence only. Hit him. Avoid
 * the hit. Finish the stock. Reach him. Cross up. Retreat bait. Escape edge.
 * One living purpose, not a courtroom of competing impulses.
 */
export function chooseHumanIntent(bot, world, attackCheck) {
  const current = bot.aiMind?.humanIntent;
  if (current?.lock > 0 && !attackCheck.valid && !emergency(world)) return { ...current, lock: current.lock - 1 };
  const name = intentName(world, attackCheck);
  const lock = name === 'AvoidHit' ? 12 : name === 'RetreatBait' ? 36 : 24;
  return { name, lock, targetX: goalX(bot, world, name) };
}

function intentName(world, attackCheck) {
  if (attackCheck.valid) return 'HitHim';
  if (world.threatVision?.panic) return 'AvoidHit';
  if (world.edgePoison?.blocked) return 'EscapeEdge';
  if (world.execution?.active) return 'FinishStock';
  if (world.fakeRetreat?.active) return 'RetreatBait';
  if (world.frustration?.forceCrossUp) return 'CrossUp';
  if (world.landing?.active && world.landing.frames < 42) return 'ReachHim';
  return 'ReachHim';
}

function goalX(bot, world, name) {
  if (name === 'AvoidHit') return bot.x + (world.threatVision?.safestX || -bot.face || 1) * 170;
  if (name === 'EscapeEdge') return bot.x + (world.edgePoison?.escapeDir || 1) * 180;
  if (name === 'RetreatBait') return bot.x + (world.fakeRetreat?.moveX || -bot.face || 1) * 150;
  if (name === 'CrossUp') return world.target.x + Math.sign(world.target.x - bot.x || 1) * 58;
  if (name === 'FinishStock') return world.target.x - (world.execution?.direction || 1) * 72;
  return world.prediction?.x ?? world.target.x;
}

function emergency(world) {
  return !!(world.threatVision?.panic || world.edgePoison?.blocked || world.execution?.active);
}
