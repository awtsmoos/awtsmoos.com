import { objectiveValue, shouldRunObjective } from './objectiveValue.js';

/**
 * B"H
 * Objective claim plan.
 *
 * Chapter 67: one bot may hear the rune louder than the brawl. It becomes the
 * runner, while the others keep pressure so the claim has meaning.
 */
export function objectiveClaimPlan(bot, world, scores = {}) {
  const value = objectiveValue(bot, world.objective, world);
  const run = shouldRunObjective(bot, world, Math.max(scores.Chase || 0, scores.EdgeCarry || 0, scores.GuaranteedAttack || 0));
  if (!run.active) return { active: false, value, x: 0, y: 0, reason: 'lowValue' };
  return { active: true, value, x: world.objective.x, y: world.objective.y, reason: run.runner ? 'runner' : 'value' };
}
