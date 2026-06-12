/**
 * B"H
 * Movement command helpers.
 *
 * Chapter 237: chase no longer worships a failed graph route. If the road is
 * unnamed, the bot moves toward predator position or the target itself, keeping
 * battle pressure alive while the deeper planners recover.
 */
export function baseCommand(bot, world) {
  const face = Math.sign(world.target.x - bot.x || bot.face || 1) || 1;
  return { x: 0, y: 0, aimX: face, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false, chargePunch: false, chargeKick: false, rapidPunch: false, rapidKick: false };
}

export function recoverCommand(bot, world, out, low) {
  out.x = toward(world.current.safe.center, bot.x);
  if (!low) return;
  out.y = -1;
  out.aimY = -1;
  out.special = !bot.grounded && bot.recoveryCooldown <= 0;
}

export function escapeCommand(bot, world, out, stuck) {
  const dir = stuck.lip?.inward || world.danger?.inward || toward(world.current.safe.center, bot.x);
  out.x = world.wall?.blocked ? toward(world.wall.escapeX, bot.x) : dir;
  out.aimX = out.x || dir;
  out.y = -1;
  out.aimY = -1;
}

export function ascendCommand(bot, world, out) {
  const x = world.step?.targetX ?? world.predatorGoal?.x ?? world.target.x;
  out.x = steer(bot, x);
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
  out.y = -1;
  out.aimY = -1;
}

export function descendCommand(bot, world, out) {
  if (!world.step) return chaseCommand(bot, world, out);
  const p = world.current.p;
  const edge = (world.step.targetX ?? world.target.x) < p.x + p.w / 2 ? p.x - 44 : p.x + p.w + 44;
  out.x = steer(bot, edge);
  out.aimX = Math.sign(out.x || 1);
  if (Math.abs(edge - bot.x) < 36) out.x = Math.sign(edge - world.current.safe.center) || out.aimX;
}

export function chaseCommand(bot, world, out) {
  const goal = chaseGoal(bot, world);
  const safeGoal = world.route?.found ? clamp(goal, world.current.safe.left, world.current.safe.right) : goal;
  out.x = steer(bot, safeGoal);
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
  if (world.combat?.shouldChaseVertical) out.y = Math.sign(world.target.y - bot.y);
}

function chaseGoal(bot, world) {
  if (!world.route?.found) return world.predatorGoal?.x ?? world.prediction?.x ?? world.target.x;
  if (world.current.id === world.goal.id) return world.combatPocket?.standX ?? world.predatorGoal?.x ?? world.target.x;
  return world.step?.targetX ?? world.predatorGoal?.x ?? world.goal.safe.center;
}

export function steer(bot, goalX) {
  const dx = goalX - bot.x;
  return Math.abs(dx) < 18 ? 0 : Math.sign(dx);
}

export function toward(goal, x) { return Math.sign(goal - x) || 1; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
