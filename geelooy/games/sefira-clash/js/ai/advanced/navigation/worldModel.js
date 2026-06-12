/**
 * B"H
 * World model for the single advanced AI mind.
 *
 * Chapter 218: the rebuilt world again carries every old organ and every new
 * death-purpose organ. Wall sense returns to the vessel, so the state machine
 * can still guard escape while KO intent guides violence.
 */
import { wallSense } from '../../sense/wallSense.js';
import { combatSense } from '../../sense/combatSense.js';
import { stageDangerAt } from '../../sense/stageDanger.js';
import { edgeCarryPlan } from '../edge/edgeCarryPlan.js';
import { ledgeKillPlan } from '../edge/ledgeKillPlan.js';
import { edgePressure } from '../combat/edgePressure.js';
import { combatPocket } from '../combat/positionPlanner.js';
import { combatTactic } from '../combat/tacticPlanner.js';
import { revengeTargetBonus } from '../emotion/revengeMemory.js';
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
import { platformGraph, nearestNode } from './platformGraph.js';
import { findPlatformRoute, nextRouteStep } from './routeSearch.js';

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
  const rich = { ...base, koPressure, ledgeKill, koIntent, launchPlan, edgeCarry, predatorGoal: predGoal };
  const pattern = updatePatternMemory(bot, target, rich);
  const landing = predictLanding(target, state.map.platforms || []);
  const bestPlatform = bestPlatformValue(bot, { ...rich, graph, map: state.map }, landing);
  const pocket = combatPocket(bot, { ...rich, pattern, landing, bestPlatform });
  const tactic = combatTactic(bot, { ...rich, combatPocket: pocket, pattern, landing, bestPlatform });
  return { ...rich, graph, pattern, landing, bestPlatform, combatPocket: pocket, combatTactic: tactic, platforms: state.map.platforms || [] };
}

export function chooseStableTarget(bot, fighters, map) {
  bot.aiMind ||= {};
  const urgent = (bot.aiMind.combatHeat?.noDamageFrames || 0) > 420 || bot.aiMind.antiPeace?.active;
  const held = fighters.find(f => f.id === bot.aiMind.targetId && !f.dead && !f.hidden && f !== bot);
  if (held && !urgent && (bot.aiMind.targetHold || 0) > 0) { bot.aiMind.targetHold--; return held; }
  let best = null;
  let score = Infinity;
  const graph = platformGraph(map);
  const botNode = nearestNode(graph, bot);
  for (const f of fighters) {
    if (f === bot || f.dead || f.hidden) continue;
    const targetNode = nearestNode(graph, f);
    const blocked = wallSense(bot, f, map).blocked ? 360 : 0;
    const s = targetScore(bot, f, graph, botNode, targetNode, blocked, urgent);
    if (s < score) { best = f; score = s; }
  }
  if (best) { bot.aiMind.targetId = best.id; bot.aiMind.targetHold = urgent ? 24 : 100; }
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

function targetScore(bot, target, graph, botNode, targetNode, blocked, urgent) {
  const dx = Math.abs(target.x - bot.x);
  const dy = Math.abs(target.y - bot.y);
  const routePenalty = routeCost(graph, botNode.id, targetNode.id, urgent);
  const platformBonus = botNode.id === targetNode.id ? 280 : 0;
  const damageBonus = Math.min(190, target.damage || 0);
  const revengeBonus = revengeTargetBonus(bot, target);
  const humanBonus = target.human && !urgent && dx < 1800 ? 70 : 0;
  const chargingBonus = Math.max(target.charge?.punch || 0, target.charge?.kick || 0, (target.chargeGlow || 0) * 90) > 14 ? 85 : 0;
  const urgentNearBonus = urgent ? Math.max(0, 320 - dx * 0.08 - dy * 0.04) : 0;
  return dx * (urgent ? 0.75 : 1) + dy * 0.52 + blocked + routePenalty - platformBonus - damageBonus - revengeBonus - humanBonus - chargingBonus - urgentNearBonus;
}

function routeCost(graph, fromId, toId, urgent) {
  if (fromId === toId) return -170;
  const route = findPlatformRoute(graph, fromId, toId);
  if (!route.found) return urgent ? 720 : 420;
  return Math.max(0, (route.nodes?.length || 1) - 1) * (urgent ? 80 : 45);
}
