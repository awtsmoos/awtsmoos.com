import { killPressure } from './killPressure.js';

/**
 * B"H
 * KO intent chooser.
 *
 * Chapter 223: horizontal kill now gets its rightful throne before generic
 * ledgeguarding. If the target is onstage near danger, the bot wants to shove
 * them out; if they are truly offstage, then edgeguarding takes over.
 */
export function chooseKoIntent(bot, world) {
  const pressure = killPressure(bot, world);
  if (world.threat?.charging && world.combat?.canHitNow) return enrich('PunishCharge', pressure);
  if (world.combat?.shouldAntiAir && pressure.up > 38) return enrich(pressure.up > 68 ? 'AntiAirKill' : 'AntiAir', pressure);
  if (pressure.side > 66 && !world.ledgeKill?.read?.offstage) return enrich('HorizontalKill', pressure);
  if (pressure.up > 74) return enrich('VerticalKill', pressure);
  if (world.ledgeKill?.active && world.ledgeKill?.read?.offstage) return enrich('EdgeGuard', pressure);
  if (pressure.carry > 42) return enrich('EdgeCarry', pressure);
  if (world.ledgeKill?.active) return enrich('EdgeCarry', pressure);
  if (world.comboMomentum?.active || world.target.damage < 55) return enrich('ComboExtend', pressure);
  return enrich('NeutralDamage', pressure);
}

function enrich(name, pressure) {
  return { name, pressure, killReady: ['VerticalKill', 'HorizontalKill', 'AntiAirKill', 'EdgeGuard'].includes(name) };
}
