/**
 * B"H
 * Zone-aware platform desire map.
 *
 * Chapter 63: the bot chooses not only a platform, but a purpose: center when
 * the arena is quiet, edge when the kill is ripe, recovery when damaged, trap
 * when the landing prophecy is bright.
 */
export function platformDesireMap(bot, world) {
  const nodes = world.graph?.nodes || [];
  let best = null, bestScore = -Infinity;
  for (const node of nodes) {
    const score = scoreNode(bot, world, node);
    if (score > bestScore) { best = node; bestScore = score; }
  }
  return best ? { node: best, x: clamp(best.safe.center, best.safe.left, best.safe.right), y: best.p.y, score: Math.round(bestScore), reason: reasonFor(bot, world, best) } : null;
}

function scoreNode(bot, world, node) {
  const zone = node.zone || world.mapZones?.zones?.[node.id] || {};
  const center = node.safe.center, targetDx = Math.abs(center - world.target.x), botDx = Math.abs(center - bot.x);
  const landingDx = world.landing?.active ? Math.abs(center - world.landing.x) : 9999;
  const itemDx = world.stageItem ? Math.abs(center - world.stageItem.x) : 9999;
  const personality = world.mapPersonality || {};
  const hunt = world.huntClock?.active ? zone.control * (8 + (personality.objectivePressure || 4)) : 0;
  const kill = world.combatHeat?.killMode || world.target.damage > 90 ? zone.edge * (6 + (personality.aggression || 5)) : 0;
  const safe = bot.damage > 90 ? zone.recovery * 9 - zone.danger * 7 : 0;
  const landing = world.landing?.active ? Math.max(0, 190 - landingDx * 0.14) + zone.landing * 5 : 0;
  const item = world.huntClock?.ignoreItems ? 0 : Math.max(0, 90 - itemDx * 0.08);
  const target = Math.max(0, 150 - targetDx * 0.065);
  const travel = botDx * (world.huntClock?.active ? 0.022 : 0.05);
  return target + landing + item + hunt + kill + safe + zone.control * 3 - travel;
}

function reasonFor(bot, world, node) {
  const zone = node.zone || world.mapZones?.zones?.[node.id] || {};
  if (world.landing?.active && Math.abs(node.safe.center - world.landing.x) < 260) return 'landingTrap';
  if (world.combatHeat?.killMode && zone.kind === 'edgeKill') return 'edgeKill';
  if (bot.damage > 90 && zone.recovery > 6) return 'recoverySafe';
  if (world.huntClock?.active && zone.kind === 'centerControl') return 'centerControl';
  if (world.stageItem && Math.abs(node.safe.center - world.stageItem.x) < 220) return 'itemValue';
  return zone.kind || 'fightPlatform';
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
