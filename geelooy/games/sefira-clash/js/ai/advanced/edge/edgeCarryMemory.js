/**
 * B"H
 * Edge carry memory.
 *
 * Chapter 81: if the exile plan fails, the bot remembers. Carry attempts cool
 * down, ratios fall, and direct violence returns to the throne.
 */
export function updateEdgeCarryMemory(bot, world, selected) {
  bot.aiMind ||= {};
  const m = bot.aiMind.edgeCarryMemory ||= { cooldown: 0, attempts: 0, lastEdgeDistance: 9999, penalty: 0 };
  m.cooldown = Math.max(0, m.cooldown - 1);
  m.penalty = Math.max(0, m.penalty - 0.18);
  const dist = edgeDistance(world);
  if (selected && !m.cooldown) {
    m.attempts++;
    if (dist >= m.lastEdgeDistance - 35) m.penalty = Math.min(80, m.penalty + 18);
    m.cooldown = 80;
  }
  m.lastEdgeDistance = dist;
  return m;
}

export function edgeCarryPenalty(bot) {
  const m = bot.aiMind?.edgeCarryMemory;
  return (m?.cooldown ? 18 : 0) + (m?.penalty || 0);
}

function edgeDistance(world) {
  const map = world.map;
  const x = world.target?.x || 0;
  return Math.min(Math.abs(x - map.bounds.left), Math.abs(map.bounds.right - x));
}
