/**
 * B"H
 * Platform desire map.
 *
 * Chapter 37: the bot stops asking only “where is he?” and starts asking where
 * the fight wants to happen. Center, landing, edge, item, and safety become a
 * small deterministic desire field.
 */
export function platformDesireMap(bot, world) {
  const nodes = world.graph?.nodes || [];
  let best = null;
  let bestScore = -Infinity;
  for (const node of nodes) {
    const score = scoreNode(bot, world, node);
    if (score > bestScore) { best = node; bestScore = score; }
  }
  return best ? { node: best, x: clamp(best.safe.center, best.safe.left, best.safe.right), y: best.p.y, score: bestScore, reason: reasonFor(bot, world, best) } : null;
}

function scoreNode(bot, world, node) {
  const p = node.p;
  const center = node.safe.center;
  const targetDx = Math.abs(center - world.target.x);
  const botDx = Math.abs(center - bot.x);
  const landingDx = world.landing?.active ? Math.abs(center - world.landing.x) : 9999;
  const itemDx = world.stageItem ? Math.abs(center - world.stageItem.x) : 9999;
  const mapCenter = (world.map.bounds.left + world.map.bounds.right) / 2;
  const centerDx = Math.abs(center - mapCenter);
  const hunt = world.huntClock?.active ? 90 : 0;
  const landing = world.landing?.active ? Math.max(0, 170 - landingDx * 0.12) : 0;
  const item = world.huntClock?.ignoreItems ? 0 : Math.max(0, 90 - itemDx * 0.08);
  const target = Math.max(0, 160 - targetDx * 0.07);
  const travel = botDx * (world.huntClock?.active ? 0.025 : 0.05);
  const centerPull = Math.max(0, 95 - centerDx * 0.015);
  const height = Math.max(0, 80 - Math.abs(p.y - world.target.y) * 0.05);
  return target + landing + item + centerPull + height + hunt - travel;
}

function reasonFor(bot, world, node) {
  if (world.landing?.active && Math.abs(node.safe.center - world.landing.x) < 260) return 'landingTrap';
  if (world.huntClock?.active) return 'huntCenter';
  if (world.stageItem && Math.abs(node.safe.center - world.stageItem.x) < 220) return 'itemValue';
  return 'fightPlatform';
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
