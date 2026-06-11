/**
 * B"H
 * Cheap platform navigation hints.
 *
 * Chapter 35: full A* can come later; today the bot receives enough wisdom to
 * know whether a destination is above, below, across a gap, or on its current
 * stone. This stops many useless wall-walks without heavy pathfinding.
 */
export function platformPlan(bot, floor, goalX, goalY) {
  const onFloor = bot.x >= floor.x && bot.x <= floor.x + floor.w;
  const nearLeft = bot.x < floor.x + 120;
  const nearRight = bot.x > floor.x + floor.w - 120;
  const above = goalY < bot.y - 95;
  const acrossLeft = goalX < floor.x && nearLeft;
  const acrossRight = goalX > floor.x + floor.w && nearRight;
  return { onFloor, above, acrossLeft, acrossRight, shouldJump: above || acrossLeft || acrossRight };
}
