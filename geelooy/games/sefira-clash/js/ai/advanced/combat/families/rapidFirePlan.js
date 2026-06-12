/**
 * B"H
 * Rapid fire plan.
 *
 * Chapter 203: rapid punches are for trapping, low percent damage, and combo
 * extension. At lethal percent, rapid fire steps aside for kill moves.
 */
export function rapidFireScore(world) {
  const damage = world.target.damage || 0;
  if (!world.combat?.reachableClose) return 0;
  if (damage > 115 && !world.comboMomentum?.active) return 0;
  let score = 18;
  if (damage < 65) score += 42;
  if (world.comboMomentum?.active) score += 34;
  if (world.target.stun > 8) score += 24;
  if (world.edgePressure?.active && damage < 90) score += 14;
  return score;
}
