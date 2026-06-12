/**
 * B"H
 * Movement command helpers.
 * Chapter 45: locomotion becomes small, named, and honest.
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
  const x = world.step?.targetX ?? world.goal.safe.center;
  out.x = steer(bot, x);
  out.aimX = Math.sign(out.x || world.target.x - bot.x || 1);
  out.y = -1;
  out.aimY = -1;
}

export function descendCommand(bot, world, out) {
  const p = world.current.p;
  const edge = (world.step?.targetX ?? world.target.x) < p.x + p.w / 2 ? p.x - 44 : p.x + p.w + 44;
  out.x = steer(bot, edge);
  out.aimX = Math.sign(out.x || 1);
  if (Math.abs(edge - bot.x) < 36) out.x = Math.sign(edge - world.current.safe.center) || out.aimX;
}

export function chaseCommand(bot, world, out) {
  const pocket = world.combatPocket;
  const raw = world.current.id === world.goal.id ? pocket.standX : world.step?.targetX ?? world.goal.safe.center;
  out.x = steer(bot, clamp(raw, world.current.safe.left, world.current.safe.right));
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
}

export function steer(bot, goalX) {
  const dx = goalX - bot.x;
  return Math.abs(dx) < 18 ? 0 : Math.sign(dx);
}

export function toward(goal, x) { return Math.sign(goal - x) || 1; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
