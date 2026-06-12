/**
 * B"H
 * Approach action.
 *
 * Chapter 197: approach means entering threat range, not walking blindly into
 * the enemy's exact body. The bot seeks a combat pocket and faces the target.
 */
export function approach(bot, goal) {
  const combat = goal.sense.combat;
  const side = combat.facing || 1;
  return { x: combat.dist > 145 ? side : combat.dist < 80 ? -side * 0.35 : 0, aimX: side, aimY: 0, y: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
}
