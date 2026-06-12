/**
 * B"H
 * Kill pocket.
 *
 * Chapter 200: the desired position is not always the target. Sometimes the bot
 * must stand behind the victim to shove outward, beneath the victim to launch
 * up, or at the ledge seam to guard the return.
 */
export function killPocket(bot, world) {
  const intent = world.koIntent?.name || 'NeutralDamage';
  if (world.ledgeKill?.active) return pocket('LedgeKill', world.ledgeKill.standX, world.ledgeKill.dir || world.launchPlan?.aimX || bot.face || 1);
  if (intent === 'VerticalKill' || intent === 'AntiAirKill') return pocket('UnderLaunch', world.target.x, Math.sign(world.target.x - bot.x || 1));
  if (intent === 'HorizontalKill' || intent === 'EdgeCarry') return pocket('CarrySide', world.edgeCarry?.standX ?? world.target.x - (world.launchPlan?.aimX || 1) * 82, world.launchPlan?.aimX || 1);
  if (intent === 'PunishCharge') return pocket('PunishCharge', world.target.x - Math.sign(world.target.face || 1) * 105, -Math.sign(world.target.face || 1));
  return pocket('FightPocket', world.target.x - Math.sign(world.target.x - bot.x || bot.face || 1) * 92, Math.sign(world.target.x - bot.x || bot.face || 1));
}

function pocket(kind, standX, aimX) {
  return { kind, standX, aimX: Math.sign(aimX || 1), aimY: 0 };
}
