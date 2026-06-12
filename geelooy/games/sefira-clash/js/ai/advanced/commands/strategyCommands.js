/** B"H - Strategy commands with dive-stun rush. */
export function applyStrategyCommand(bot, world, out, opportunity) {
  if (world.hazard?.danger > 35) return hazardEscape(bot, world, out);
  if (world.edgePoison?.blocked) return poisonedEdgeEscape(bot, world, out);
  if (world.threatVision?.panic) return threatDodge(bot, world, out);
  if (world.diveStunRush?.active && applyDiveStunRush(bot, world, out)) return true;
  if (world.dive?.active && applyDiveCommand(bot, world, out)) return true;
  if (world.fakeRetreat?.active) return fakeRetreatMove(bot, world, out);
  if (world.frustration?.frustrated) return frustratedMove(bot, world, out);
  if (world.commitmentLease?.active && followLease(bot, world, out)) return true;
  if (opportunity.name === 'ObjectiveChase' && world.objectivePlan?.active) return moveTo(out, bot, world.objectivePlan.x, world.target.x, true);
  if (opportunity.name === 'ItemChase' && world.stageItem) return moveTo(out, bot, world.stageItem.x, world.target.x, true);
  if (world.antiWander?.active) return moveTo(out, bot, world.antiWander.x, world.target.x, true);
  if (killOpportunity(opportunity.name) && world.predatorGoal) return moveTo(out, bot, world.predatorGoal.x, world.target.x, false);
  if (world.antiPeace?.active || opportunity.intent === 'ForceApproach' || world.huntClock?.active) return forceEngage(bot, world, out);
  if (urgentNoStillness(world) && noStillnessMove(bot, world, out)) return true;
  if (opportunity.name === 'LandingIntercept') return moveTo(out, bot, world.landing.x, world.target.x, false);
  if (opportunity.name === 'EdgePressure') return moveTo(out, bot, world.edgePressure.standX, world.edgePressure.attackToward, false);
  if (opportunity.name === 'CenterControl') return moveTo(out, bot, centerX(world), world.target.x, true);
  if (world.predatorGoal) return moveTo(out, bot, world.predatorGoal.x, world.target.x, false);
  return false;
}

function applyDiveStunRush(bot, world, out) {
  const p = world.diveStunRush;
  moveTo(out, bot, p.x, p.x, true);
  out.special = true;
  out.aimX = Math.sign(p.x - bot.x || bot.face || 1);
  out.aimY = 0;
  bot.aiMind.diveStunRush = { active: true, victimId: p.victimId, frames: p.frames };
  return true;
}
function applyDiveCommand(bot, world, out) {
  const d = world.dive;
  if (d.kind === 'plunge') { out.x = Math.abs(world.target.x - bot.x) < 24 ? 0 : Math.sign(world.target.x - bot.x); out.y = 1; out.down = true; out.aimX = Math.sign(world.target.x - bot.x || bot.face || 1); out.aimY = 1; out.special = true; bot.aiMind.diveIntent = 'plunge'; return true; }
  if (d.kind === 'setupJump') { out.x = Math.abs(d.x - bot.x) < 18 ? 0 : Math.sign(d.x - bot.x); out.aimX = Math.sign(world.target.x - bot.x || out.x || 1); out.aimY = -1; out.hunt = true; bot.aiMind.diveIntent = 'setupJump'; return true; }
  return false;
}
function followLease(bot, world, out) { const l = world.commitmentLease; return Number.isFinite(l.x) && moveTo(out, bot, l.x, world.target.x, l.kind !== 'edge'); }
function killOpportunity(name) { return ['EdgeCarry', 'HorizontalKill', 'VerticalKill', 'EdgeGuard'].includes(name); }
function hazardEscape(bot, world, out) { out.x = Math.sign(bot.x - world.hazard.x || world.target.x - bot.x || 1); out.aimX = Math.sign(world.target.x - bot.x || out.x || 1); return true; }
function threatDodge(bot, world, out) { out.x = world.threatVision.safestX || -Math.sign(world.target.x - bot.x || 1); out.aimX = Math.sign(world.target.x - bot.x || out.x || 1); return true; }
function fakeRetreatMove(bot, world, out) { out.x = world.fakeRetreat.moveX || -Math.sign(world.target.x - bot.x || 1); out.aimX = Math.sign(world.target.x - bot.x || 1); return true; }
function urgentNoStillness(world) { return ['nearEnemy', 'edgeLoop', 'frustrated'].includes(world.noStillness?.reason); }
function poisonedEdgeEscape(bot, world, out) { const dir = world.edgePoison.escapeDir || Math.sign(world.current.safe.center - bot.x || 1) || 1; out.x = dir; out.y = 0; out.aimX = Math.sign(world.target.x - bot.x || dir || 1); out.aimY = 0; return true; }
function noStillnessMove(bot, world, out) { out.x = world.noStillness.moveDir || Math.sign(world.target.x - bot.x || bot.face || 1); out.aimX = Math.sign(world.target.x - bot.x || out.x || 1); return true; }
function frustratedMove(bot, world, out) { const dir = world.frustration.forceStepThrough ? Math.sign(world.target.x - bot.x || 1) : -Math.sign(world.target.x - bot.x || 1); out.x = dir; out.aimX = Math.sign(world.target.x - bot.x || dir); if (world.frustration.forceJab) out.rapidPunch = true; return true; }
function forceEngage(bot, world, out) { const goal = world.resourcePing?.active ? world.resourcePing.x : world.objectivePlan?.active ? world.objectivePlan.x : world.fightCluster?.hottest?.x ?? world.predatorGoal?.x ?? world.target.x; return moveTo(out, bot, goal, world.target.x, true); }
function moveTo(out, bot, x, aimRef, hunt) { out.x = Math.abs(x - bot.x) < 16 ? 0 : Math.sign(x - bot.x); out.aimX = Math.sign((Number.isFinite(aimRef) ? aimRef : x) - bot.x || out.x || bot.face || 1); if (hunt) out.hunt = true; return true; }
function centerX(world) { return world.platformDesire?.x ?? (world.map.bounds.left + world.map.bounds.right) / 2; }
