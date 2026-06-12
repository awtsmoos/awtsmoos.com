import { combatSense } from '../sense/combatSense.js';
import { edgeSense } from '../sense/edgeSense.js';
import { threatSense } from '../sense/threatSense.js';
import { planCombat } from './combatPlanner.js';
import { planRecovery } from './recoveryPlanner.js';
import { planRoute } from './routePlanner.js';

/**
 * B"H
 * Unified AI goal planner with danger-map weighting.
 *
 * Chapter 240: every sensory scroll is completed before the council speaks.
 * If threat or edge is missing, the planner rebuilds it, so no bot thought can
 * collapse into undefined while the arena is moving.
 */
export function planGoal(bot, target, map) {
  const routePlan = planRoute(bot, target, map);
  const route = routePlan.route;
  const edge = edgeSense(bot, route.current);
  const combat = combatSense(bot, target);
  const threat = threatSense(bot, target, route, edge);
  const sense = { target, route, edge, combat, threat, danger: null };
  return choose(bot, sense, routePlan);
}

export function planGoalFromSense(bot, world) {
  const route = world.route;
  const edge = world.edge || edgeSense(bot, route.current);
  const combat = world.combat || combatSense(bot, world.target);
  const threat = world.threat || threatSense(bot, world.target, route, edge);
  const sense = { ...world, route, edge, combat, threat };
  const routePlan = route.same ? { kind: 'fight', score: 0, route } : {
    kind: route.needsDrop ? 'dropChase' : 'route',
    score: 780 + (route.needsDrop ? 65 : 0) - (sense.danger?.score || 0) * (route.needsDrop ? 0.05 : 0.3),
    route
  };
  return choose(bot, sense, routePlan);
}

function choose(bot, sense, routePlan) {
  const recovery = planRecovery(bot, sense);
  const fight = planCombat(sense);
  const dangerRetreat = sense.danger?.score > 150 && !sense.route?.needsDrop ? { kind: 'edgeSafe', score: 940 } : { kind: 'none', score: 0 };
  return best([recovery, routePlan, fight, dangerRetreat], sense);
}

function best(plans, sense) {
  let chosen = plans[0];
  for (const plan of plans) if (plan.score > chosen.score) chosen = plan;
  return { ...chosen, sense };
}
