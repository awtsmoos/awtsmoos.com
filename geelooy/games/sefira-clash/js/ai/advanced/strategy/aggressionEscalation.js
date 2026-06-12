/**
 * B"H
 * Aggression escalation.
 *
 * Chapter 67: if no damage is born, the arena gets impatient. The bot becomes
 * less interested in elegant pressure and more interested in closing distance,
 * rapid punches, and direct fighting.
 */
export function updateAggression(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.aggression ||= { noDamageFrames: 0, lastTargetDamage: world.target.damage, value: 1 };
  const a = bot.aiMind.aggression;
  if (world.target.damage > a.lastTargetDamage) a.noDamageFrames = 0;
  else a.noDamageFrames++;
  a.lastTargetDamage = world.target.damage;
  a.value = a.noDamageFrames > 420 ? 2.15 : a.noDamageFrames > 300 ? 1.75 : a.noDamageFrames > 180 ? 1.35 : 1;
  bot.aiMind.noHitFrames = a.noDamageFrames;
  return { value: a.value, noDamageFrames: a.noDamageFrames, hungry: a.value > 1.3 };
}

export function applyAggression(scores, aggression) {
  if (!aggression?.hungry) return scores;
  return {
    ...scores,
    Chase: Math.round((scores.Chase || 0) * aggression.value + 24),
    LandingIntercept: Math.round((scores.LandingIntercept || 0) * Math.min(1.25, aggression.value)),
    EdgePressure: Math.round((scores.EdgePressure || 0) / Math.min(1.8, aggression.value)),
    CenterControl: Math.round((scores.CenterControl || 0) * 0.55)
  };
}
