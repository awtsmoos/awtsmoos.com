/**
 * B"H
 * Wall-block sense for NPC pathfinding.
 *
 * Chapter 257: a target across a vertical wall is not merely nearby. The bot
 * must see the obstruction, choose a top or side opening, and walk there before
 * trying to fight through stone.
 */
export function wallSense(bot, target, map) {
  const walls = map.walls || [];
  let best = null;
  for (const wall of walls) {
    if (!between(bot.x, target.x, wall.x, wall.x + wall.w)) continue;
    if (!verticalOverlap(bot, target, wall)) continue;
    const escape = escapePoint(bot, target, wall, map);
    best = { blocked: true, wall, escapeX: escape.x, escapeY: escape.y, side: Math.sign(escape.x - bot.x) || 1 };
    break;
  }
  return best || { blocked: false, wall: null, escapeX: target.x, escapeY: target.y, side: Math.sign(target.x - bot.x) || 1 };
}

function verticalOverlap(bot, target, wall) {
  const top = Math.min(bot.y - 170, target.y - 170);
  const bottom = Math.max(bot.y + 8, target.y + 8);
  return bottom > wall.y && top < wall.y + wall.h;
}

function escapePoint(bot, target, wall, map) {
  const preferTop = Math.abs(bot.y - wall.y) < Math.abs(bot.y - (wall.y + wall.h));
  const rightDoor = wall.x + wall.w + 110;
  const leftDoor = wall.x - 110;
  const sideDoor = Math.abs(bot.x - leftDoor) < Math.abs(bot.x - rightDoor) ? leftDoor : rightDoor;
  const topDoor = target.x < wall.x ? leftDoor : rightDoor;
  const x = preferTop && hasHeadroom(wall, map) ? topDoor : sideDoor;
  return { x, y: preferTop ? wall.y - 40 : bot.y };
}

function hasHeadroom(wall, map) {
  const boundsTop = map.bounds?.top ?? -99999;
  return wall.y - boundsTop > 260;
}

function between(a, b, left, right) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return right > min && left < max;
}
