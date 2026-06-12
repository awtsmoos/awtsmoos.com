/**
 * B"H
 * World model with hunt, reputation, platform desire, and landing traps.
 *
 * Chapter 41: the bot now sees more than bodies. It sees habits, desired
 * platforms, landing prophecy, and the hunt clock burning under quiet grass.
 */
import { wallSense } from '../../sense/wallSense.js';
import { combatSense } from '../../sense/combatSense.js';
import { stageDangerAt } from '../../sense/stageDanger.js';
import { edgeCarryPlan } from '../edge/edgeCarryPlan.js';
import { ledgeKillPlan } from '../edge/ledgeKillPlan.js';
import { edgePressure } from '../combat/edgePressure.js';
import { combatPocket } from '../combat/positionPlanner.js';
import { combatTactic } from '../combat/tacticPlanner.js';
import { killPressure } from '../kill/killPressure.js';
import { chooseKoIntent } from '../kill/koIntent.js';
import { launchDirection } from '../kill/launchDirection.js';
import { humanPrediction } from '../prediction/humanPrediction.js';
import { predatorGoal } from '../position/predatorGoal.js';
import { powerupValue } from '../resources/powerupValue.js';
import { threatAwareness } from '../combat/threatAwareness.js';
import { updatePatternMemory } from '../strategy/patternMemory.js';
import { bestPlatformValue } from '../strategy/platformValue.js';
import { predictLanding } from '../strategy/landingPredictor.js';
import { targetMotion } from '../strategy/targetMotion.js';
import { updateAttackReputation } from '../strategy/attackReputation.js';
import { landingTrap } from '../strategy/landingTrap.js';
import { platformDesireMap } from '../strategy/platformDesireMap.js';
import { platformGraph, nearestNode } from './platformGraph.js';
import { findPlatformRoute, nextRouteStep } from './routeSearch.js';
import { targetScore } from './targetScoring.js';

export function buildWorld(bot, target, state) {
  const graph = platformGraph(state.map);
  const current = nearestNode(graph, bot);
  const goal = nearestNode(graph, target);
  const route = findPlatformRoute(graph, current.id, goal.id);
  const step = nextRouteStep(graph, route);
  const danger = stageDangerAt(bot.x, bot.y, state.map, current.p);
  const wall = wallSense(bot, target, state.map);
  const combat = combatSense(bot, target);
  const threat = threatAwareness(bot, target);
  const motion = targetMotion(target);
  const prediction = humanPrediction(target, 24);
  const objective = objectiveInfo(bot, state);
  const hazard = nearestHazard(bot, state);
  const partial = { state, map: state.map, target, current, goal, route, step, danger, wall, combat, threat, motion, prediction, hazard, objective };
  const stageItem = nearestStageItem(bot, state, partial);
  const edge = edgePressure(bot, { ...partial, stageItem });
  const base = { ...partial, stageItem, edgePressure: edge };
  const koPressure = killPressure(bot, base);
  const ledgeKill = ledgeKillPlan(bot, { ...base, koPressure });
  const koIntent = chooseKoIntent(bot, { ...base, koPressure, ledgeKill });
  const launchPlan = launchDirection(bot, { ...base, koPressure, ledgeKill, koIntent }, koIntent.name);
  const edgeCarry = edgeCarryPlan(bot, { ...base, koPressure, koIntent, launchPlan });
  const predGoal = predatorGoal(bot, { ...base, koPressure, koIntent, launchPlan, edgeCarry, ledgeKill });
  const rich = { ...base, koPressure, ledgeKill, koIntent, launchPlan, edgeCarry, predatorGoal: predGoal, graph };
  const pattern = updatePatternMemory(bot, target, rich);
  const landing = predictLanding(target, state.map.platforms || []);
  const attackReputation = updateAttackReputation(bot, { ...rich, pattern, landing });
  const huntClock = bot.aiMind?.huntClock || bot.aiMind?.combatHeat?.hunt || null;
  const bestPlatform = bestPlatformValue(bot, { ...rich, graph, map: state.map }, landing);
  const withPlatform = { ...rich, pattern, landing, attackReputation, huntClock, bestPlatform };
  const platformDesire = platformDesireMap(bot, withPlatform);
  const trap = landingTrap(bot, { ...withPlatform, platformDesire });
  const pocket = combatPocket(bot, { ...withPlatform, platformDesire, landingTrap: trap });
  const tactic = combatTactic(bot, { ...withPlatform, platformDesire, landingTrap: trap, combatPocket: pocket });
  return { ...withPlatform, platformDesire, landingTrap: trap, combatPocket: pocket, combatTactic: tactic, platforms: state.map.platforms || [] };
}

export function chooseStableTarget(bot, fighters, map) {
  bot.aiMind ||= {};
  const heat = bot.aiMind.combatHeat || {};
  const urgent = (heat.noDamageFrames || 0) > 220 || bot.aiMind.antiPeace?.active || bot.aiMind.huntClock?.active;
  const held = fighters.find(f => f.id === bot.aiMind.targetId && !f.dead && !f.hidden && f !== bot);
  if (held && !urgent && (bot.aiMind.targetHold || 0) > 0) { bot.aiMind.targetHold--; return held; }
  const graph = platformGraph(map);
  const botNode = nearestNode(graph, bot);
  let best = null;
  let score = Infinity;
  for (const f of fighters) {
    if (f === bot || f.dead || f.hidden) continue;
    const targetNode = nearestNode(graph, f);
    const s = targetScore(bot, f, map, graph, botNode, targetNode, urgent);
    if (s < score) { best = f; score = s; }
  }
  if (best) { bot.aiMind.targetId = best.id; bot.aiMind.targetHold = urgent ? 10 : 60; bot.aiMind.targetScore = Math.round(score); }
  return best;
}

function objectiveInfo(bot, state) {
  const o = state.objective;
  if (!o) return null;
  const d = Math.hypot(o.x - bot.x, (o.y - (bot.y - 90)) * 0.6);
  return { ...o, distance: d, score: Math.max(0, (o.value || 90) - d * 0.045 + (o.hold || 0) * 0.18) };
}

function nearestStageItem(bot, state, world) {
  let best = null;
  let score = Infinity;
  for (const item of state.powerups || []) {
    if (!item.active) continue;
    const d = Math.hypot(item.x - bot.x, (item.y - bot.y) * 0.5);
    const candidate = { ...item, distance: d };
    const value = powerupValue(bot, candidate, world);
    const s = d - value * 3;
    if (s < score) { best = { ...candidate, score: value }; score = s; }
  }
  return best;
}

function nearestHazard(bot, state) {
  let best = null;
  let distance = Infinity;
  for (const h of state.hazards || []) {
    const d = Math.hypot(h.x - bot.x, h.y - (bot.y - 80));
    if (d < distance) { best = { ...h, distance: d, danger: Math.max(0, h.radius + 80 - d) }; distance = d; }
  }
  return best;
}
