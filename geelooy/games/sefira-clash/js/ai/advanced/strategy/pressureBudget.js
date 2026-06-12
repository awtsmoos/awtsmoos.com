/**
 * B"H
 * Pressure budget.
 *
 * Chapter 82: pressure can no longer fall asleep on peaceful maps. Heat, kill
 * mode, target damage, and forced engagement all raise the flame while whiffs
 * still keep the flame disciplined.
 */
export function updatePressure(bot, world, attackCheck) {
  bot.aiMind ||= {};
  const p = bot.aiMind.pressure ||= { value: 45 };
  if (attackCheck.valid) p.value += 6;
  if (world.combatHeat?.forceEngage) p.value += 5;
  if (world.combatHeat?.killMode) p.value += 4;
  if (world.edgePressure?.score > 0.5) p.value += 1.5;
  if (world.target.damage > bot.damage) p.value += 2;
  if (bot.aiMind.memory?.lastAttackHit) p.value += 5;
  if (bot.aiMind.comboMomentum?.active) p.value += 4;
  if (bot.aiMind.memory && Object.keys(bot.aiMind.memory.whiffs || {}).length) p.value -= 2.5;
  if (bot.damage > 120 && !world.combatHeat?.killMode) p.value -= 3;
  if (world.threat?.charging) p.value -= bot.damage > 85 ? 4 : 0.5;
  p.value = Math.max(0, Math.min(100, p.value * 0.99));
  return { value: p.value, high: p.value > 62, low: p.value < 28 };
}
