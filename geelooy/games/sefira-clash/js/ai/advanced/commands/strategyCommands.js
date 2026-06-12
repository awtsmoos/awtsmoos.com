/**
 * B"H
 * Strategy movement commands.
 *
 * Chapter 240: edge poison now speaks first after hazards. When the lip becomes
 * a loop, the bot obeys one inward direction and refuses every shiny objective,
 * route, or predator pocket until the curse breaks.
 */
export function applyStrategyCommand(bot, world, out, opportunity) {
  if (world.hazard?.danger > 35) return hazardEscape(bot, world, out);
  if (world.edgePoison?.blocked) return poisonedEdgeEscape(bot, world, out);
  if (world.threatVision?.panic) return threatDodge(bot, world, out);
  if (world.fakeRetreat?.active) return fakeRetreatMove(bot, world, out);
  if (world.frustration?.frustrated) return frustratedMove(bot, world, out);
  if (opportunity.name === 'ItemChase' && world.stageItem) return moveTo(out, bot, world.stageItem.x, world.target.x);
  if (opportunity.name === 'ObjectiveChase' && world.objective) return moveTo(out, bot, world.objective.x, world.target.x);
  if (killOpportunity(opportunity.name) && world.predatorGoal) return moveTo(out, bot, world.predatorGoal.x, world.target.x);
  if (world.humanIntent?.name === 'CrossUp') return moveTo(out, bot, world.humanIntent.targetX, world.target.x);
  if (world.humanIntent?.name === 'FinishStock') return moveTo(out, bot, world.humanIntent.targetX, world.target.x);
  if (world.antiPeace?.active || opportunity.intent === 'ForceApproach') return forceEngage(bot, world, out);
  if (urgentNoStillness(world) && noStillnessMove(bot, world, out)) return true;
  if (world.comboMomentum?.active || opportunity.intent === 'ComboContinue') return moveTo(out, bot, world.target.x, world.target.x);
  if (opportunity.name === 'LandingIntercept') return moveTo(out, bot, world.landing.x, world.target.x);
  if (opportunity.name === 'EdgePressure') return moveTo(out, bot, world.edgePressure.standX, world.edgePressure.attackToward);
  if (opportunity.name === 'CenterControl') return moveTo(out, bot, centerX(world), world.target.x);
  if (world.predatorGoal) return moveTo(out, bot, world.predatorGoal.x, world.target.x);
  return false;
}

function killOpportunity(name) {
  return ['EdgeCarry', 'HorizontalKill', 'VerticalKill', 'EdgeGuard'].includes(name);
}

function hazardEscape(bot, world, out) {
  out.x = Math.sign(bot.x - world.hazard.x || world.target.x - bot.x || 1);
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
  return true;
}

function threatDodge(bot, world, out) {
  out.x = world.threatVision.safestX || -Math.sign(world.target.x - bot.x || 1);
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
  return true;
}

function fakeRetreatMove(bot, world, out) {
  out.x = world.fakeRetreat.moveX || -Math.sign(world.target.x - bot.x || 1);
  out.aimX = Math.sign(world.target.x - bot.x || 1);
  return true;
}

function urgentNoStillness(world) {
  return ['nearEnemy', 'edgeLoop', 'frustrated'].includes(world.noStillness?.reason);
}

function poisonedEdgeEscape(bot, world, out) {
  const dir = world.edgePoison.escapeDir || Math.sign(world.current.safe.center - bot.x || 1) || 1;
  out.x = dir;
  out.y = 0;
  out.aimX = Math.sign(world.target.x - bot.x || dir || 1);
  out.aimY = 0;
  return true;
}

function noStillnessMove(bot, world, out) {
  out.x = world.noStillness.moveDir || Math.sign(world.target.x - bot.x || bot.face || 1);
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
  return true;
}

function frustratedMove(bot, world, out) {
  const dir = world.frustration.forceStepThrough ? Math.sign(world.target.x - bot.x || 1) : -Math.sign(world.target.x - bot.x || 1);
  out.x = dir;
  out.aimX = Math.sign(world.target.x - bot.x || dir);
  if (world.frustration.forceJab) out.rapidPunch = true;
  return true;
}

function forceEngage(bot, world, out) {
  const goal = world.landing?.active && world.landing.frames < 45 ? world.landing.x : world.predatorGoal?.x ?? world.humanIntent?.targetX ?? world.prediction?.x ?? world.target.x;
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
