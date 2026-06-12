/**
 * B"H
 * Kill confirm planner.
 *
 * Chapter 77: when damage is high, the AI stops asking for polite pokes. It
 * seeks launch direction, edge finish, anti-air enders, or charged violence —
 * still under the validator, still lawful, but sharper.
 */
export function killConfirmTactic(bot, world, fallback) {
  if (!shouldKill(world)) return fallback;
  const c = world.combat;
  const edge = world.edgePressure;
  if (c.shouldAntiAir) return tactic('KillAntiAir', 'punch', Math.sign(world.target.x - bot.x || bot.face || 1), -1, true);
  if (edge?.active && edge.score > 0.3) return tactic('EdgeFinishKick', 'kick', edge.attackToward, 0, false);
  if (c.reachableClose) return tactic('KillLauncher', 'kick', c.facing, -0.1, true);
  if (c.canHitNow) return tactic('KillPoke', 'kick', c.facing, 0, true);
  return fallback;
}

export function shouldKill(world) {
  return !!(world.combatHeat?.killMode || world.target.damage >= 90 || world.threat?.targetKillable);
}

function tactic(kind, button, aimX, aimY, instant) {
  return { kind, button, aimX: Math.sign(aimX || 1), aimY, instant };
}
