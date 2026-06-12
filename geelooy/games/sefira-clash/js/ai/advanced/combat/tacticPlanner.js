import { killConfirmTactic } from './killConfirmPlanner.js';

/**
 * B"H
 * Combat tactic planner with kill pressure and anti-peace hunger.
 *
 * Chapter 79: courage now has teeth. Low damage invites rapid pressure, high
 * damage demands launchers, and old quiet maps receive a decree of engagement.
 * Still, every chosen strike must pass the validator before a command is born.
 */
export function combatTactic(bot, world) {
  const c = world.combat;
  const edge = world.edgePressure;
  const threat = world.threat || {};
  const heat = world.combatHeat || {};
  let chosen = baseTactic(bot, world, c, edge, threat, heat);
  chosen = killConfirmTactic(bot, world, chosen);
  return chosen;
}

function baseTactic(bot, world, c, edge, threat, heat) {
  if (threat.panic) return tactic('EvadeCharge', 'none', threat.escapeSide, 0, false);
  if (threat.charging && c.reachableClose) return tactic('InterruptCharge', 'kick', threat.flankSide, 0, true);
  if (threat.charging && c.sameFightingLane) return tactic('FlankCharge', 'none', threat.flankSide, 0, false);
  if (c.reachableClose && world.target.blocking) return tactic('GrabShield', 'grab', 0, 0, true);
  if (c.shouldAntiAir) return tactic(heat.killMode ? 'KillAntiAir' : 'AntiAir', 'punch', c.facing, -1, true);
  if (heat.comboMode && c.reachableClose) return tactic('ComboRapid', 'punch', c.facing, 0, true);
  if (edge?.score > 0.45 && c.sameFightingLane) return tactic('EdgeChargeKick', 'kick', edge.attackToward, 0, false);
  if (heat.forceEngage && c.canHitNow) return tactic('ForceKick', 'kick', c.facing, 0, true);
  if ((c.killPercent || threat.targetKillable) && c.reachableGround) return tactic('KillChargePunch', 'punch', c.facing, -0.08, false);
  if (threat.defensive && c.reachableClose) return tactic('DefensiveKick', 'kick', c.facing, 0, true);
  if (c.reachableClose) return tactic(heat.forceEngage ? 'ForcePunch' : 'PunishClose', 'punch', c.facing, 0, true);
  if (c.canHitNow) return tactic('PokeApproach', 'kick', c.facing, 0, true);
  return tactic('Approach', 'none', c.facing, 0, false);
}

function tactic(kind, button, aimX, aimY, instant) {
  return { kind, button, aimX: Math.sign(aimX || 1), aimY, instant };
}
