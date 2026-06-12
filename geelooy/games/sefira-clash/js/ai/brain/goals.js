import { clampGoalToFloor } from './edgeSafety.js';

/**
 * B"H
 * Platform-route bot goals.
 *
 * Chapter 227: descent is allowed to leave the safe center. Route-drop goals
 * deliberately point beyond the upper platform edge, because the only true path
 * downward is sometimes outside the rectangle itself.
 */
export function goalX(bot, w, intent) {
  const predicted = w.predicted || w.target || { x: bot.x + (w.dx || 0), y: bot.y + (w.dy || 0) };
  let goal = w.route?.targetX ?? predicted.x;
  if (intent === 'recover' || intent === 'edgeSafe') goal = w.safety?.center ?? w.edge?.center ?? bot.x;
  else if (intent === 'route') goal = w.route?.targetX ?? predicted.x;
  else if (intent === 'denyRecovery') goal = predicted.x;
  else if (intent === 'ledgeTrap') goal = w.recovery?.ledgeX ?? predicted.x;
  else if (intent === 'powerup') goal = w.powerup.x;
  else if (intent === 'perch') goal = w.territory.perch.x;
  else if (intent === 'weapon') goal = w.weapon.x;
  else if (intent === 'separate') goal = bot.x + separationSide(bot, w) * 220;
  else if (intent === 'unstick') goal = unstickGoal(bot, w);
  else if (intent === 'retreat' || intent === 'bait') goal = bot.x - Math.sign(w.dx || 1) * 190;
  else if (w.route && !w.route.same) goal = w.route.targetX;
  else if (intent === 'brawl') goal = predicted.x - Math.sign(w.dx || 1) * 64;
  else if (intent === 'pressure' || intent === 'punish') goal = predicted.x - Math.sign(w.dx || 1) * 92;
  else goal = predicted.x - Math.sign(w.dx || 1) * 105;
  return shouldClamp(intent, w) && w.safety ? clampGoalToFloor(goal, w.safety) : goal;
}

export function steer(bot, goal, intent, crowdPush = 0, safety = null) {
  const dx = goal - bot.x;
  let base = Math.abs(dx) < 18 ? 0 : Math.sign(dx);
  if (safety?.danger && intent !== 'denyRecovery' && intent !== 'ledgeTrap') base = safety.inward || base;
  const crowd = intent === 'brawl' || intent === 'pressure' ? crowdPush * 0.08 : crowdPush * 0.35;
  const blended = Math.max(-1, Math.min(1, base + crowd));
  const fast = ['route', 'punish', 'recover', 'edgeSafe', 'unstick', 'perch', 'denyRecovery', 'brawl', 'pressure'].includes(intent);
  return blended * (fast ? 1 : intent === 'bait' ? 0.5 : 0.86);
}

function unstickGoal(bot, w) {
  if (w.route?.action === 'drop') return w.route.targetX;
  if (w.route?.action === 'jump') return w.route.targetX;
  return bot.x + (bot.ai.laneBias || 1) * 360;
}

function shouldClamp(intent, w) {
  if (intent === 'route' && w.route?.needsDrop) return false;
  return !['denyRecovery', 'ledgeTrap', 'recover'].includes(intent);
}

function separationSide(bot, w) {
  return Math.sign(w.crowdPush || -w.dx || bot.ai.laneBias || 1);
}
