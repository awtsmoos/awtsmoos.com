/**
 * B"H
 * Charge attack plan.
 *
 * Chapter 204: a charge is not hesitation. It is chosen when the enemy is high
 * percent, landing, trapped near an edge, or predicted to remain in the strike
 * lane long enough for thunder to ripen.
 */
export function chargeAttackScore(world) {
  if (!world.combat?.sameFightingLane) return 0;
  const damage = world.target.damage || 0;
  const predictionClose = Math.abs((world.prediction?.x || world.target.x) - world.target.x) < 170;
  let score = 0;
  if (damage > 95) score += 34;
  if (damage > 135) score += 26;
  if (world.edgePressure?.active) score += 22;
  if (world.landing?.active && world.landing.frames < 38) score += 20;
  if (predictionClose) score += 14;
  if (world.target.stun > 10) score += 18;
  if (world.combat?.reachableClose && damage < 70) score -= 24;
  return Math.max(0, score);
}
