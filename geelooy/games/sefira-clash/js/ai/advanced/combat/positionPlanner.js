/**
 * B"H
 * Combat position planner with violent spacing modes.
 *
 * Chapter 80: distance becomes temperament. Combo wants the chest close, kill
 * mode stands at launcher range, anti-peace closes the gap, and normal battle
 * keeps enough room to breathe.
 */
export function combatPocket(bot, world) {
  const c = world.combat;
  const edge = world.edgePressure;
  const threat = world.threat || {};
  if (threat.panic) return pocket('PanicEvade', bot.x + threat.escapeSide * 220, threat.flankSide, 0);
  if (threat.charging && c.sameFightingLane) return pocket('FlankCharge', world.target.x + threat.flankSide * 110, threat.escapeSide, 0);
  if (c.shouldAntiAir) return pocket('AntiAir', world.target.x, 0, -1);
  if (edge?.active && c.sameFightingLane && !world.antiPeace?.active) return edgePocket(world, edge);
  if (c.canHitNow) return pocket('ThreatHold', world.target.x - c.facing * spacing(world, 78), c.facing, 0);
  return pocket('ApproachPocket', world.target.x - c.facing * spacing(world, 108), c.facing, 0);
}

function spacing(world, normal) {
  if (world.comboMomentum?.active) return 62;
  if (world.antiPeace?.active) return 70;
  if (world.combatHeat?.killMode) return 82;
  if (world.combatHeat?.forceEngage) return 76;
  return normal;
}

function edgePocket(world, edge) {
  const aimX = edge.attackToward || Math.sign(world.target.x || 1);
  if (edge.distance < 115 || world.combatHeat?.killMode) return pocket('PushOffstage', edge.standX, aimX, 0);
  return pocket('HerdToEdge', edge.standX, aimX, 0);
}

function pocket(kind, standX, aimX, aimY) {
  return { kind, standX, aimX: Math.sign(aimX || 1), aimY };
}
