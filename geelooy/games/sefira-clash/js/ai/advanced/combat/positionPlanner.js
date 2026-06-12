import { personalSpace } from './personalSpace.js';

/**
 * B"H
 * Combat position planner with predator pockets.
 *
 * Chapter 210: the old spacing remains, but KO intent can override it with a
 * predator pocket: stand to carry, stand under to launch, or stand at the ledge
 * to end the return.
 */
export function combatPocket(bot, world) {
  const c = world.combat;
  const threat = world.threat || {};
  const predator = world.predatorGoal;
  const space = personalSpace(bot, world);
  if (world.threatVision?.panic) return pocket('ThreatDodge', bot.x + world.threatVision.safestX * 180, world.threatVision.safestX, 0);
  if (threat.panic) return pocket('PanicEvade', bot.x + threat.escapeSide * 220, threat.flankSide, 0);
  if (predator && predator.kind !== 'FightPocket' && predator.distance > 22) return pocket(predator.kind, predator.x, predator.aimX, predator.aimY || 0);
  if (threat.charging && c.sameFightingLane) return pocket('FlankCharge', world.target.x + threat.flankSide * 110, threat.escapeSide, 0);
  if (world.humanIntent?.name === 'CrossUp') return pocket('CrossUp', world.humanIntent.targetX, c.facing, 0);
  if (c.shouldAntiAir) return pocket('AntiAir', world.prediction?.x ?? world.target.x, 0, -1);
  if (c.canHitNow) return pocket('ThreatHold', space.standX, c.facing, 0);
  return pocket(predator?.kind || 'ApproachPocket', predator?.x ?? space.standX, predator?.aimX ?? c.facing, 0);
}

function pocket(kind, standX, aimX, aimY) {
  return { kind, standX, aimX: Math.sign(aimX || 1), aimY };
}
