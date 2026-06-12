/**
 * B"H
 * Threat sense.
 *
 * Chapter 192: threat is not fear; it is measurement. The bot watches charge,
 * incoming attacks, high damage, ledges, and whether the opponent is ready to
 * kill.
 */
export function threatSense(bot, target, route, edge) {
  const incoming = !!target.attack && Math.abs(target.x - bot.x) < 210 && Math.abs(target.y - bot.y) < 170;
  const killDanger = bot.damage > 115 && incoming;
  const ledgeTrap = edge.danger && target.damage < bot.damage;
  return {
    incoming,
    killDanger,
    ledgeTrap,
    targetCharged: (target.chargeGlow || 0) > 0.65,
    selfCritical: bot.damage > 145,
    routeBad: !route.same && edge.danger
  };
}
