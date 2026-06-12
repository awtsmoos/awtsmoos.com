/**
 * B"H
 * Movement command helpers with trap/platform/hunt goals.
 *
 * Chapter 46: feet obey strategy. Landing trap, platform desire, predator
 * pocket, and hunt clock become actual travel goals instead of debug poetry.
 */
export function baseCommand(bot, world) {
  const face = Math.sign(world.target.x - bot.x || bot.face || 1) || 1;
  return { x: 0, y: 0, aimX: face, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false, chargePunch: false, chargeKick: false, rapidPunch: false, rapidKick: false, hunt: false };
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

export function ascendCommand(bot, world, out) { travelTo(bot, world, out, climbGoal(bot, world)); out.y = -1; out.aimY = -1; }

export function descendCommand(bot, world, out) {
  if (!world.step) return chaseCommand(bot, world, out);
  const p = world.current.p;
  const edge = (world.step.targetX ?? world.target.x) < p.x + p.w / 2 ? p.x - 44 : p.x + p.w + 44;
  travelTo(bot, world, out, edge);
  if (Math.abs(edge - bot.x) < 36) out.x = Math.sign(edge - world.current.safe.center) || out.aimX;
}

export function chaseCommand(bot, world, out) { travelTo(bot, world, out, chaseGoal(bot, world)); }

function travelTo(bot, world, out, goal) {
  const slack = huntSlack(bot);
  const safeGoal = world.route?.found && !world.landingTrap?.active ? clamp(goal, world.current.safe.left - slack, world.current.safe.right + slack) : goal;
  out.x = committedSteer(bot, world, safeGoal);
  out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
  if (world.combat?.shouldChaseVertical) out.y = Math.sign(world.target.y - bot.y);
  markHunt(bot, world, out);
}

function chaseGoal(bot, world) {
  if (world.landingTrap?.active) return world.landingTrap.x;
  if (world.platformDesire && shouldTakePlatform(bot, world)) return world.platformDesire.x;
  const bored = (bot.aiMind?.combatHeat?.noDamageFrames || 0) > 160;
  if (!world.route?.found) return world.predatorGoal?.x ?? world.prediction?.x ?? world.target.x;
  if (world.current.id === world.goal.id && !bored) return world.combatPocket?.standX ?? world.predatorGoal?.x ?? world.target.x;
  return world.step?.targetX ?? world.predatorGoal?.x ?? world.goal.safe.center;
}

function climbGoal(bot, world) { return world.landingTrap?.x ?? world.platformDesire?.x ?? world.step?.targetX ?? world.predatorGoal?.x ?? world.target.x; }
function shouldTakePlatform(bot, world) { const d = world.platformDesire; return d && (d.reason === 'landingTrap' || world.huntClock?.active || Math.abs(d.x - bot.x) > 260); }
function committedSteer(bot, world, goalX) { const dx = goalX - bot.x; if (Math.abs(dx) < 18 && Math.abs(world.target.x - bot.x) > 220) return Math.sign(world.target.x - bot.x) || bot.face || 1; return steer(bot, goalX); }
function markHunt(bot, world, out) { const far = Math.abs(world.target.x - bot.x) > 620 || Math.abs(world.target.y - bot.y) > 380; const bored = (bot.aiMind?.combatHeat?.noDamageFrames || 0) > 130; out.hunt = !!out.x && (far || bored || world.huntClock?.active); }
function huntSlack(bot) { return Math.min(320, Math.max(40, (bot.aiMind?.combatHeat?.noDamageFrames || 0) * 0.45)); }
export function steer(bot, goalX) { const dx = goalX - bot.x; return Math.abs(dx) < 18 ? 0 : Math.sign(dx); }
export function toward(goal, x) { return Math.sign(goal - x) || 1; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
