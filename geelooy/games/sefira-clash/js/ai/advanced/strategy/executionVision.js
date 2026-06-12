/**
 * B"H
 * Execution vision.
 *
 * Chapter 119: when the enemy is wounded by the edge, the bot stops thinking in
 * polite exchanges. It sees the stock as almost gone and reaches for launch,
 * kick, pressure, and position that ends the matter.
 */
export function executionVision(bot, world) {
  const target = world.target;
  const edge = world.edgePressure;
  const highDamage = target.damage >= 105;
  const nearEdge = edge?.active && (edge.distance ?? 999) < 230;
  const offstage = target.y > (world.map.bounds.bottom - 120) || target.x < world.map.bounds.left + 90 || target.x > world.map.bounds.right - 90;
  const active = highDamage && (nearEdge || offstage);
  const direction = edge?.attackToward || Math.sign(target.x - bot.x || bot.face || 1);
  return { active, highDamage, nearEdge, offstage, direction, score: active ? 100 : highDamage ? 35 : 0 };
}
