/**
 * B"H
 * World model for the single advanced AI mind.
 *
 * Chapter 89: target choice now obeys battle proximity. The human is important,
 * but not if the bot spends five quiet minutes crossing the heavens while an
 * enemy stands nearer. Anti-peace shortens target hold and favors reachable
 * bodies so violence can actually happen.
 */
import { wallSense } from '../../sense/wallSense.js';
import { combatSense } from '../../sense/combatSense.js';
import { stageDangerAt } from '../../sense/stageDanger.js';
import { edgePressure } from '../combat/edgePressure.js';
import { combatPocket } from '../combat/positionPlanner.js';
import { combatTactic } from '../combat/tacticPlanner.js';
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
  const partial = { target, current, goal, combat, threat, motion, map: state.map };
  const edge = edgePressure(bot, partial);
  const pattern = updatePatternMemory(bot, target, { ...partial, edgePressure: edge });
  const landing = predictLanding(target, state.map.platforms || []);
  const bestPlatform = bestPlatformValue(bot, { ...partial, graph, edgePressure: edge, map: state.map }, landing);
  const pocket = combatPocket(bot, { ...partial, edgePressure: edge, pattern, landing, bestPlatform });
  const tactic = combatTactic(bot, { ...partial, edgePressure: edge, combatPocket: pocket, pattern, landing, bestPlatform });
  return { state, map: state.map, target, graph, current, goal, route, step, danger, wall, combat, threat, motion, pattern, landing, bestPlatform, edgePressure: edge, combatPocket: pocket, combatTactic: tactic, platforms: state.map.platforms || [] };
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
    const s = targetScore(bot, f, map, graph, botNode, targetNode, blocked, urgent);
    if (s < score) { best = f; score = s; }
  }
  if (best) { bot.aiMind.targetId = best.id; bot.aiMind.targetHold = urgent ? 24 : 100; }
  return best;
}

function targetScore(bot, target, map, graph, botNode, targetNode, blocked, urgent) {
  const dx = Math.abs(target.x - bot.x);
  const dy = Math.abs(target.y - bot.y);
  const routePenalty = routeCost(graph, botNode.id, targetNode.id, urgent);
  const platformBonus = botNode.id === targetNode.id ? 280 : 0;
  const damageBonus = Math.min(190, target.damage || 0);
  const humanBonus = target.human && !urgent && dx < 1800 ? 70 : 0;
  const chargingBonus = Math.max(target.charge?.punch || 0, target.charge?.kick || 0, (target.chargeGlow || 0) * 90) > 14 ? 85 : 0;
  const urgentNearBonus = urgent ? Math.max(0, 320 - dx * 0.08 - dy * 0.04) : 0;
  return dx * (urgent ? 0.75 : 1) + dy * 0.52 + blocked + routePenalty - platformBonus - damageBonus - humanBonus - chargingBonus - urgentNearBonus;
}

function routeCost(graph, fromId, toId, urgent) {
  if (fromId === toId) return -170;
  const route = findPlatformRoute(graph, fromId, toId);
  if (!route.found) return urgent ? 720 : 420;
  return Math.max(0, (route.nodes?.length || 1) - 1) * (urgent ? 80 : 45);
}
