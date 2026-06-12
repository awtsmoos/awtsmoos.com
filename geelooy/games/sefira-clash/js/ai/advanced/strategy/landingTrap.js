/**
 * B"H
 * Landing trap planner.
 *
 * Chapter 39: the bot stops chasing the shadow and waits where the feet must
 * fall. A landing read becomes a pocket, a counter, and a small prophecy.
 */
export function landingTrap(bot, world) {
  const landing = world.landing;
  if (!landing?.active || landing.frames < 8 || landing.frames > 70) return inactive('notLanding');
  const dx = Math.abs(landing.x - bot.x);
  const reachable = dx < 720 || world.huntClock?.active;
  const valuable = world.attackReputation?.counter === 'landingTrap' || world.combatHeat?.killMode || world.huntClock?.active;
  if (!reachable || !valuable) return inactive('lowValue');
  const side = Math.sign(world.target.x - landing.x || bot.face || 1) || 1;
  return { active: true, x: landing.x - side * 82, y: landing.y, aimX: side, aimY: -0.2, frames: landing.frames, reason: world.attackReputation?.counter || 'landing' };
}

function inactive(reason) {
  return { active: false, reason };
}
