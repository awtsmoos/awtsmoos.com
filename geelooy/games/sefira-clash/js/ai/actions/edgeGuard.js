/**
 * B"H
 * Edge-guard action.
 *
 * Chapter 201: edge-guarding means guarding the gate, not falling through it.
 * The bot stands inside safe stone and attacks outward only when the enemy is
 * vulnerable.
 */
export function edgeGuard(bot, goal) {
  const edge = goal.sense.edge;
  const combat = goal.sense.combat;
  const side = combat.facing || bot.face || 1;
  const safeX = bot.x < edge.center ? Math.max(edge.left, edge.center - 160) : Math.min(edge.right, edge.center + 160);
  const walk = Math.abs(bot.x - safeX) > 24 ? Math.sign(safeX - bot.x) : 0;
  return { x: walk, aimX: side, aimY: 0, y: 0, down: false, jump: false, punch: combat.dist < 190, kick: false, grab: false, shield: combat.dist > 190, special: false };
}
