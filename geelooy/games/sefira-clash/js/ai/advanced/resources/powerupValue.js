/**
 * B"H
 * AI powerup value.
 *
 * Chapter 191: a fighter does not value every gift the same. Heavy Gloves shine
 * beside wounded enemies, Shield Crystal calls to the damaged, Wings call from
 * ledges, Speed Boots call across distance, and Magnet calls when gifts abound.
 */
export function powerupValue(bot, item, world = {}) {
  if (!item) return 0;
  const base = item.value || 40;
  const role = item.role || 'resource';
  const distancePenalty = (item.distance || 0) * 0.045;
  return Math.max(0, base + roleBonus(bot, role, world) - distancePenalty);
}

function roleBonus(bot, role, world) {
  if (role === 'kill') return killBonus(world);
  if (role === 'chase') return chaseBonus(bot, world);
  if (role === 'survive') return surviveBonus(bot);
  if (role === 'recover') return recoverBonus(bot, world);
  if (role === 'pressure') return pressureBonus(world);
  if (role === 'burst') return burstBonus(world);
  if (role === 'resource') return resourceBonus(world);
  return 0;
}

function killBonus(world) {
  return (world.target?.damage || 0) > 90 ? 46 : world.edgePressure?.active ? 28 : 0;
}

function chaseBonus(bot, world) {
  const dx = Math.abs((world.target?.x || bot.x) - bot.x);
  return dx > 520 ? 38 : world.hunger?.starving ? 26 : 8;
}

function surviveBonus(bot) {
  return (bot.damage || 0) > 105 ? 56 : (bot.damage || 0) > 70 ? 28 : 0;
}

function recoverBonus(bot, world) {
  return world.danger?.offstage || bot.y > (world.map?.bounds?.bottom || 1200) - 250 ? 54 : 12;
}

function pressureBonus(world) {
  return world.comboMomentum?.active ? 34 : world.hunger?.hungry ? 20 : 8;
}

function burstBonus(world) {
  return world.combatHeat?.killMode ? 42 : world.antiPeace?.active ? 30 : 12;
}

function resourceBonus(world) {
  return world.stageItem?.distance < 500 ? 24 : 8;
}
