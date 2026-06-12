import { killPressure } from './killPressure.js';

/**
 * B"H
 * KO intent chooser with severe EdgeCarry restraint.
 *
 * Chapter 88: the edge is now a finishing route, not a wandering religion. If
 * the victim is not ripe or already near death's border, the bot must fight.
 */
export function chooseKoIntent(bot, world) {
  const pressure = killPressure(bot, world);
  const percent = world.target.damage || 0;
  const hugeMap = (world.mapAnalysis?.width || 0) > 8000;
  if (world.threat?.charging && world.combat?.canHitNow) return enrich('PunishCharge', pressure);
  if (world.combat?.shouldAntiAir && pressure.up > 34) return enrich(pressure.up > 64 ? 'AntiAirKill' : 'AntiAir', pressure);
  if (pressure.side > 58 && percent > 82) return enrich('HorizontalKill', pressure);
  if (pressure.up > 68 && percent > 78) return enrich('VerticalKill', pressure);
  if (world.ledgeKill?.active && world.ledgeKill?.read?.offstage) return enrich('EdgeGuard', pressure);
  if (shouldCarry(percent, pressure, hugeMap, world)) return enrich('EdgeCarry', pressure);
  if (world.comboMomentum?.active || percent < 76) return enrich('ComboExtend', pressure);
  return enrich('NeutralDamage', pressure);
}

function shouldCarry(percent, pressure, hugeMap, world) {
  const edgeDist = distanceToEdge(world);
  if (percent < 118) return false;
  if (edgeDist > 1050) return false;
  if (hugeMap && percent < 145) return false;
  if (world.goal?.zone?.kind === 'centerControl') return false;
  return pressure.carry > 72 || (!!pressure.window?.carryNeeded && pressure.carry > 58);
}

function distanceToEdge(world) {
  const x = world.target?.x || 0;
  const b = world.map.bounds;
  return Math.min(Math.abs(x - b.left), Math.abs(b.right - x));
}

function enrich(name, pressure) {
  return { name, pressure, killReady: ['VerticalKill', 'HorizontalKill', 'AntiAirKill', 'EdgeGuard'].includes(name) };
}
