/**
 * B"H
 * Launch direction planner.
 *
 * Chapter 195: attacks receive a direction of purpose. Side kills push outward,
 * vertical kills lift, edgeguards spike or shove, and damage combos keep the
 * victim close enough for the next word of violence.
 */
export function launchDirection(bot, world, intent) {
  const target = world.target;
  const out = outward(bot, world);
  if (intent === 'VerticalKill' || intent === 'AntiAirKill') return { name: 'up', aimX: Math.sign(target.x - bot.x || bot.face || 1) * 0.18, aimY: -1 };
  if (intent === 'MeteorKill') return { name: 'down', aimX: Math.sign(target.x - bot.x || bot.face || 1) * 0.2, aimY: 1 };
  if (intent === 'HorizontalKill' || intent === 'EdgeGuard') return { name: 'forward', aimX: out, aimY: -0.08 };
  if (intent === 'EdgeCarry') return { name: 'carry', aimX: out, aimY: -0.02 };
  if (intent === 'ComboExtend') return { name: 'combo', aimX: Math.sign(target.x - bot.x || bot.face || 1), aimY: -0.25 };
  return { name: 'neutral', aimX: Math.sign(target.x - bot.x || bot.face || 1), aimY: 0 };
}

export function outward(bot, world) {
  const bounds = world.map?.bounds || { left: -1200, right: 1200 };
  const target = world.target;
  const leftDistance = Math.abs(target.x - bounds.left);
  const rightDistance = Math.abs(bounds.right - target.x);
  return leftDistance < rightDistance ? -1 : 1;
}
