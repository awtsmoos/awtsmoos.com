/**
 * B"H
 * Role assignment.
 *
 * Chapter 79: the bots stop all wanting the same crown. One hunts, one claims,
 * one denies, one guards the edge, one survives; chaos becomes choreography.
 */
export function assignRole(bot, world) {
  const p = bot.personality || {};
  if (world.threatVision?.panic || bot.damage > 130) return role('Survivor', 0.9);
  if (world.resourcePing?.active && shouldResource(bot, world)) return role(world.resourcePing.type === 'item' ? 'Denier' : 'ResourceRunner', 0.86);
  if (world.combat?.shouldAntiAir || world.attackReputation?.counter === 'antiAir') return role('AntiAir', 0.74);
  if (world.ledgeKill?.active || p.edgeGuard > 1.2) return role('EdgeGuard', 0.72);
  if (world.huntClock?.active || p.aggression > 1.15) return role('Hunter', 0.68);
  if (p.survival > 1.18) return role('CenterControl', 0.58);
  return role('Hunter', 0.5);
}

function shouldResource(bot, world) {
  const id = Number(String(bot.id || '').replace(/\D/g, '')) || 0;
  if (bot.personality?.resource > 1.08) return true;
  if ((world.combatHeat?.noDamageFrames || 0) > 180) return true;
  return id % 3 === 0;
}
function role(name, confidence) { return { name, confidence }; }
