import { chargeAttackScore } from './chargeAttackPlan.js';
import { rapidFireScore } from './rapidFirePlan.js';

/** B"H - Attack family scoring with reputation, traps, and kill mode. */
export function scoreAttackFamilies(world) {
  const intent = world.koIntent?.name || 'NeutralDamage';
  const heat = aggressionHeat(world);
  const rep = reputationBonus(world);
  const kill = killHeat(world);
  const trap = world.landingTrap?.active ? 48 : 0;
  return {
    rapid: rapidFireScore(world) + intentBonus(intent,'rapid') + closeHeat(world,heat)*0.3 + rep.combo,
    jab: baseJab(world) + intentBonus(intent,'jab') + heat + rep.pressure,
    kick: baseKick(world) + intentBonus(intent,'kick') + heat*1.1 + rep.fall + trap*0.45,
    chargePunch: chargeAttackScore(world) + intentBonus(intent,'chargePunch') + kill*0.7 + rep.charge,
    chargeKick: chargeAttackScore(world) + intentBonus(intent,'chargeKick') + kill*0.8 + rep.fall + trap,
    antiAir: antiAirScore(world) + intentBonus(intent,'antiAir') + rep.air,
    meteor: meteorScore(world) + intentBonus(intent,'meteor') + rep.fall*0.7,
    grab: grabScore(world) + intentBonus(intent,'grab') + rep.grab
  };
}
function reputationBonus(world){
 const c=world.attackReputation?.counter;
 return {grab:c==='grab'?72:0,air:c==='antiAir'?58:0,fall:c==='landingTrap'?56:0,charge:c==='punishCharge'?50:0,combo:c==='comboExtend'?32:0,pressure:c==='neutral'?0:12};
}
function intentBonus(intent,family){
 const t={NeutralDamage:{rapid:20,jab:18,kick:14},ComboExtend:{rapid:42,jab:24,kick:12},EdgeCarry:{kick:48,chargeKick:28,jab:18},HorizontalKill:{chargePunch:42,chargeKick:48,kick:42},VerticalKill:{antiAir:58,chargePunch:30,kick:18},AntiAirKill:{antiAir:66,chargePunch:18},EdgeGuard:{meteor:48,chargeKick:34,kick:32},PunishCharge:{kick:42,chargePunch:32,grab:16,jab:10}};
 return t[intent]?.[family]||0;
}
function baseJab(w){return w.combat?.reachableClose?44:w.combat?.sameFightingLane?18:10;}
function baseKick(w){return w.combat?.canHitNow?48:w.combat?.sameFightingLane?26:14;}
function antiAirScore(w){return w.combat?.shouldAntiAir||w.attackReputation?.counter==='antiAir'?66:0;}
function meteorScore(w){return w.ledgeKill?.read?.low||w.landingTrap?.active&&w.target?.damage>85?66:0;}
function grabScore(w){return (w.target?.blocking||w.attackReputation?.counter==='grab')&&w.combat?.reachableClose?70:0;}
function aggressionHeat(w){let h=0; if(w.hunger?.hungry)h+=10; if(w.hunger?.starving)h+=18; if(w.combatHeat?.forceEngage)h+=22; if(w.huntClock?.active)h+=18; if(w.antiPeace?.active)h+=16; if(w.target?.stun>4)h+=8; return h;}
function closeHeat(w,h){return w.combat?.reachableClose?h+12:h;}
function killHeat(w){return w.combatHeat?.killMode?36:w.koIntent?.killReady?30:w.koPressure?.lethal?24:0;}
