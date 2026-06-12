import { executeIntent } from './brain/execute.js';
import { prepareMemory } from './brain/memory.js';
import { senseWorld } from './brain/sense.js';
import { chooseTarget } from './brain/threats.js';
import { planGoalFromSense } from './planning/goals.js';

/**
 * B"H
 * Bot brain entry with danger-map and planned descent permission.
 *
 * Chapter 238: the bot now plans from the full sensory scroll: route, combat
 * lane, edge law, and danger map. It may descend through an edge doorway, but
 * it retreats from accidental danger and stops striking air.
 */
export function driveBots(state) {
  for (const bot of state.fighters) {
    if (bot.human || bot.dead) continue;
    prepareMemory(bot);
    const target = stableTarget(bot, state.fighters);
    if (!target) continue;
    const world = senseWorld(bot, target, state);
    const goal = planGoalFromSense(bot, world);
    const intent = intentFromGoal(goal, world);
    const input = executeIntent(bot, world, intent);
    bot.input = finalGovernor(bot, world, goal, input, intent);
  }
}

function intentFromGoal(goal, world) {
  if (goal.kind === 'recover') return 'recover';
  if (goal.kind === 'edgeSafe') return 'edgeSafe';
  if (goal.kind === 'route' || goal.kind === 'jumpChase' || goal.kind === 'dropChase') return 'route';
  if (goal.kind === 'grab' || goal.kind === 'rapid') return 'brawl';
  if (goal.kind === 'upAttack' || goal.kind === 'smash') return world.whiff ? 'punish' : 'pressure';
  if (goal.kind === 'shield') return 'bait';
  return 'pressure';
}

function finalGovernor(bot, world, goal, input, intent) {
  const out = { ...input };
  const descent = isPlannedDescent(world, intent);
  const danger = world.safety?.danger || predictsEdge(bot, world, out) || world.danger?.score > 190;
  if (danger && !descent && intent !== 'denyRecovery' && intent !== 'ledgeTrap') guardEdge(bot, world, out);
  else enforcePlannerAggression(bot, world, goal, out);
  if (bot.ai.stuck > 70 || bot.ai.dither > 34 || bot.ai.routeFail > 70) breakStuck(bot, world, out, danger, descent);
  return sanitizeImpossibleAttack(world, out);
}

function enforcePlannerAggression(bot, world, goal, out) {
  const combat = goal.sense?.combat;
  const side = Math.sign(world.dx || out.x || bot.face || 1) || 1;
  bot.face = side;
  out.aimX = side;
  if (goal.kind === 'jumpChase') { out.aimY = -1; out.y = -1; out.x ||= side; return; }
  if (goal.kind === 'dropChase') { out.down = false; out.y = 1; out.x ||= side; return; }
  if (!combat?.canHitNow) return;
  if (goal.kind === 'grab') out.grab = combat.shouldGrab;
  if (goal.kind === 'rapid' && combat.shouldRapid && !bot.attack && !bot.ai.chargePlan) out.punch = true;
  if (goal.kind === 'upAttack' && combat.shouldAntiAir) { out.aimY = -1; out.y = -1; out.punch = true; out.jump ||= world.dy < -130; }
  if (goal.kind === 'smash' && combat.reachableGround) { out.punch = true; out.kick = false; }
  if (world.route?.same && combat.reachableClose && !out.punch && !out.kick && !out.grab && !bot.attack) out.punch = true;
}

function sanitizeImpossibleAttack(world, out) {
  const combat = world.combat || null;
  if (!combat) return out;
  const canAttack = combat.canHitNow || combat.shouldAntiAir;
  if (canAttack) return out;
  out.punch = false;
  out.kick = false;
  out.grab = false;
  out.special = false;
  if (combat.shouldChaseVertical) {
    out.down = false;
    out.y = combat.aboveLane ? -1 : combat.belowLane ? 1 : 0;
  }
  return out;
}

function guardEdge(bot, world, out) {
  const inward = world.danger?.inward || world.safety?.inward || Math.sign((world.safety?.center || world.floor.x + world.floor.w / 2) - bot.x) || 1;
  out.x = inward;
  out.jump = false;
  out.down = false;
  out.y = Math.min(0, out.y || 0);
}

function breakStuck(bot, world, out, danger, descent) {
  out.x = danger && !descent ? (world.safety?.inward || out.x || bot.ai.laneBias || 1) : (out.x || bot.ai.laneBias || 1);
  out.jump ||= !!world.route?.needsJump && Math.abs((world.route.targetX ?? bot.x) - bot.x) < 82;
  out.down = false;
  bot.ai.routeFail = Math.max(0, bot.ai.routeFail - 12);
}

function isPlannedDescent(world, intent) {
  return intent === 'route' && !!world.route?.needsDrop;
}

function predictsEdge(bot, world, input) {
  if (!bot.grounded || !world.route?.current) return false;
  const floor = world.route.current;
  const left = floor.x + 125;
  const right = floor.x + floor.w - 125;
  const accelIntent = (input.x || 0) * 38;
  const futureX = bot.x + (bot.vx || 0) * 7 + accelIntent;
  const futureLater = bot.x + (bot.vx || 0) * 16 + accelIntent * 1.9;
  return futureX < left || futureX > right || futureLater < left || futureLater > right;
}

function stableTarget(bot, fighters) {
  bot.ai.targetHold = Math.max(0, bot.ai.targetHold || 0);
  const held = fighters.find(f => f.id === bot.ai.targetId && !f.dead && f !== bot);
  if (held && bot.ai.targetHold > 0) { bot.ai.targetHold--; return held; }
  const chosen = chooseTarget(bot, fighters);
  if (chosen) { bot.ai.targetId = chosen.id; bot.ai.targetHold = 58; }
  return chosen;
}
