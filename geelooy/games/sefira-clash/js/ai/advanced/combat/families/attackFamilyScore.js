import { chargeAttackScore } from './chargeAttackPlan.js';
import { rapidFireScore } from './rapidFirePlan.js';

/**
 * B"H
 * Attack family scoring.
 *
 * Chapter 231: the bot becomes a little more violent without becoming foolish.
 * If combat heat, hunger, or edge-carry pressure rises, jab and kick refuse to
 * fall silent. Charge still seeks death, rapid still traps low percent, but the
 * default body now keeps throwing hands instead of admiring its own plan.
 */
export function scoreAttackFamilies(world) {
  const intent = world.koIntent?.name || 'NeutralDamage';
  const heat = aggressionHeat(world);
  return {
    rapid: rapidFireScore(world) + intentBonus(intent, 'rapid') + closeHeat(world, heat) * 0.35,
    jab: baseJab(world) + intentBonus(intent, 'jab') + heat,
    kick: baseKick(world) + intentBonus(intent, 'kick') + heat * 1.15,
    chargePunch: chargeAttackScore(world) + intentBonus(intent, 'chargePunch') + killHeat(world) * 0.45,
    chargeKick: chargeAttackScore(world) + intentBonus(intent, 'chargeKick') + killHeat(world) * 0.55,
    antiAir: antiAirScore(world) + intentBonus(intent, 'antiAir'),
    meteor: meteorScore(world) + intentBonus(intent, 'meteor'),
    grab: grabScore(world) + intentBonus(intent, 'grab')
  };
}

function intentBonus(intent, family) {
  const table = {
    NeutralDamage: { rapid: 20, jab: 18, kick: 14 },
    ComboExtend: { rapid: 40, jab: 22, kick: 12 },
    EdgeCarry: { kick: 42, chargeKick: 22, jab: 18, chargePunch: 10 },
    HorizontalKill: { chargePunch: 32, chargeKick: 38, kick: 38, jab: 10 },
    VerticalKill: { antiAir: 44, chargePunch: 24, kick: 18 },
    AntiAirKill: { antiAir: 55, chargePunch: 16, kick: 10 },
    EdgeGuard: { meteor: 42, chargeKick: 30, kick: 30 },
    PunishCharge: { kick: 38, chargePunch: 24, grab: 14, jab: 10 }
  };
  return table[intent]?.[family] || 0;
}

function baseJab(world) {
  if (world.combat?.reachableClose) return 44;
  if (world.combat?.sameFightingLane) return 18;
  return 10;
}

function baseKick(world) {
  if (world.combat?.canHitNow) return 46;
  if (world.combat?.sameFightingLane) return 24;
  return 14;
}

function antiAirScore(world) {
  return world.combat?.shouldAntiAir ? 62 : 0;
}

function meteorScore(world) {
  return world.ledgeKill?.read?.low ? 62 : 0;
}

function grabScore(world) {
  return world.target?.blocking && world.combat?.reachableClose ? 58 : 0;
}

function aggressionHeat(world) {
  let heat = 0;
  if (world.hunger?.hungry) heat += 10;
  if (world.hunger?.starving) heat += 18;
  if (world.combatHeat?.forceEngage) heat += 20;
  if (world.antiPeace?.active) heat += 16;
  if (world.koIntent?.name === 'EdgeCarry') heat += 14;
  if (world.koIntent?.name === 'HorizontalKill') heat += 18;
  if (world.target?.stun > 4) heat += 8;
  return heat;
}

function closeHeat(world, heat) {
  return world.combat?.reachableClose ? heat + 12 : heat;
}

function killHeat(world) {
  return world.koIntent?.killReady ? 24 : world.koPressure?.lethal ? 18 : 0;
}
