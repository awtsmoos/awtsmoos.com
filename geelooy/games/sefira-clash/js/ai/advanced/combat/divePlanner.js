/**
 * B"H
 * Dive planner, aggressive head-crush edition.
 *
 * Chapter 97: the bots now crave the vertical ambush. If they can get above a
 * skull, they will try. If they are above it, they will plunge.
 */
export function divePlan(bot, world) {
  const target = world.target;
  const dx = target.x - bot.x;
  const dy = target.y - bot.y;
  const aligned = Math.abs(dx) < 170;
  const above = dy > 58;
  const valuable = target.grounded || target.blocking || target.stun > 0 || world.role?.name === 'Hunter' || world.role?.name === 'AntiAir' || world.combatHeat?.killMode;
  if (!bot.grounded && above && aligned && valuable) return active('plunge', 160, target.x, 1);
  if (!bot.grounded && above && Math.abs(dx) < 260) return active('plunge', 118, target.x, 1);
  if (shouldSetup(bot, world, dx, dy)) return active('setupJump', 142, target.x - Math.sign(dx || bot.face || 1) * 18, -1);
  return { active: false, kind: 'none', score: 0, x: target.x, y: target.y };
}

function shouldSetup(bot, world, dx, dy) {
  if (!bot.grounded) return false;
  if (Math.abs(dx) > 520 || Math.abs(dy) > 330) return false;
  if (world.threatVision?.panic || bot.damage > 155) return false;
  if (world.target.diveStunned) return false;
  if (world.role?.name === 'Hunter' || world.role?.name === 'AntiAir') return true;
  if (world.huntClock?.active || world.combatHeat?.killMode) return true;
  if (world.target.blocking || world.target.stun > 0) return true;
  return world.attackReputation?.counter === 'landingTrap' || world.pattern?.shieldRate > 0.35;
}
function active(kind, score, x, aimY) { return { active: true, kind, score, x, aimY }; }
