/**
 * B"H
 * Edge pressure evaluator.
 *
 * Chapter 10: the platform is no longer a flat sentence. Its left and right
 * lips become prophecy. The Awtsmoos shows the NPC which side of the target is
 * nearest exile, which side is center-safety, and where to stand so a kick may
 * write the enemy toward the blast wind instead of into empty air.
 *
 * @param {object} bot Acting NPC.
 * @param {object} world Sensed world packet.
 * @returns {object} Edge pressure tactical geometry.
 */
export function edgePressure(bot, world) {
  const p = world.goal?.p || world.current?.p;
  const target = world.target;
  if (!p || !target) return neutral(bot, world);
  const leftGap = target.x - p.x;
  const rightGap = p.x + p.w - target.x;
  const side = leftGap < rightGap ? -1 : 1;
  const ledgeX = side < 0 ? p.x : p.x + p.w;
  const distance = Math.abs(target.x - ledgeX);
  const centerX = p.x + p.w / 2;
  const pressureSide = -side;
  const standX = target.x + pressureSide * standDistance(distance);
  const score = Math.max(0, 1 - distance / 420);
  return {
    side,
    ledgeX,
    centerX,
    distance,
    score,
    active: score > 0.18,
    attackToward: side,
    standX: clamp(standX, p.x + 60, p.x + p.w - 60),
    enemyNearLeft: leftGap < 260,
    enemyNearRight: rightGap < 260
  };
}

function neutral(bot, world) {
  const target = world.target || bot;
  return { side: Math.sign(target.x - bot.x || 1), ledgeX: target.x, centerX: target.x, distance: Infinity, score: 0, active: false, attackToward: Math.sign(target.x - bot.x || 1), standX: target.x };
}

function standDistance(distance) {
  if (distance < 115) return 82;
  if (distance < 230) return 112;
  return 145;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
