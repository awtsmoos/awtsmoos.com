/**
 * B"H
 * Strategy movement commands.
 *
 * Chapter 85: strategy now knows the difference between elegant control and
 * battle-hunger. Anti-peace walks directly toward conflict; combo momentum
 * pursues the launch; center control only exists when the arena is not thirsty.
 */
export function applyStrategyCommand(bot, world, out, opportunity) {
  if (world.antiPeace?.active || opportunity.intent === 'ForceApproach') return forceEngage(bot, world, out);
  if (world.comboMomentum?.active || opportunity.intent === 'ComboContinue') return moveTo(out, bot, world.target.x, world.target.x);
  if (opportunity.name === 'LandingIntercept') return moveTo(out, bot, world.landing.x, world.target.x);
  if (opportunity.name === 'EdgePressure') return moveTo(out, bot, world.edgePressure.standX, world.edgePressure.attackToward);
  if (opportunity.name === 'CenterControl') return moveTo(out, bot, centerX(world), world.target.x);
  return false;
}

function forceEngage(bot, world, out) {
  const goal = world.landing?.active && world.landing.frames < 45 ? world.landing.x : world.target.x;
  moveTo(out, bot, goal, world.target.x);
  if (Math.abs(goal - bot.x) < 120 && Math.abs(world.target.y - bot.y) > 120) out.y = Math.sign(world.target.y - bot.y);
  return true;
}

function moveTo(out, bot, x, aimRef) {
  out.x = Math.abs(x - bot.x) < 16 ? 0 : Math.sign(x - bot.x);
  out.aimX = Math.sign((Number.isFinite(aimRef) ? aimRef : x) - bot.x || out.x || bot.face || 1);
  return true;
}

function centerX(world) {
  return (world.map.bounds.left + world.map.bounds.right) / 2;
}
