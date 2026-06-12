/**
 * B"H
 * Objective value for AI.
 *
 * Chapter 66: a rune is not decoration. Quiet, control maps, close range, and
 * denial turn it into a commandment of movement.
 */
export function objectiveValue(bot, objective, world = {}) {
  if (!objective) return 0;
  const d = Math.hypot(objective.x - bot.x, (objective.y - bot.y) * 0.5);
  const quiet = Math.min(70, (world.combatHeat?.noDamageFrames || 0) * 0.12);
  const map = world.mapPersonality?.objectivePressure || world.map?.personality?.objectivePressure || 4;
  const hold = (objective.hold || 0) * 0.7;
  const close = Math.max(0, 180 - d * 0.22);
  const denial = enemyNearObjective(bot, objective, world) ? 42 : 0;
  const safety = world.threatVision?.panic ? -70 : world.hazard?.danger > 30 ? -50 : 0;
  return Math.max(0, (objective.value || 100) + quiet + map * 9 + hold + close + denial + safety - d * 0.035);
}

export function shouldRunObjective(bot, world, opportunityScore = 0) {
  const value = objectiveValue(bot, world.objective, world);
  const runner = chooseRunner(bot, world);
  return { active: !!world.objective && runner && value > Math.max(90, opportunityScore * 0.7), value, runner };
}

function chooseRunner(bot, world) {
  if (!world.objective) return false;
  const id = Number(String(bot.id || '').replace(/\D/g, '')) || 0;
  const quiet = (world.combatHeat?.noDamageFrames || 0) > 240;
  return quiet || id % 3 === 0 || bot.personality?.resource > 1.05;
}

function enemyNearObjective(bot, objective, world) {
  return (world.state?.fighters || []).some(f => f !== bot && !f.dead && !f.hidden && Math.hypot(f.x - objective.x, (f.y - objective.y) * 0.5) < 260);
}
