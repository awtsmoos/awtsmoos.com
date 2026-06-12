/** B"H - World model with timed dive-stun rush. */
import { wallSense } from '../../sense/wallSense.js';
import { combatSense } from '../../sense/combatSense.js';
import { stageDangerAt } from '../../sense/stageDanger.js';
import { divePlan } from '../combat/divePlanner.js';
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
import { buildFightClusters, nearestCluster, hottestCluster } from '../strategy/fightClusters.js';
import { updatePatternMemory } from '../strategy/patternMemory.js';
import { bestPlatformValue } from '../strategy/platformValue.js';
import { predictLanding } from '../strategy/landingPredictor.js';
import { targetMotion } from '../strategy/targetMotion.js';
import { updateAttackReputation } from '../strategy/attackReputation.js';
import { landingTrap } from '../strategy/landingTrap.js';
import { platformDesireMap } from '../strategy/platformDesireMap.js';
import { readDiveStunPing } from '../strategy/diveStunPing.js';
import { readResourcePing } from '../strategy/resourcePing.js';
import { antiWanderLaw } from '../strategy/antiWanderLaw.js';
import { assignRole } from '../strategy/roleAssignment.js';
import { platformGraph, nearestNode } from './platformGraph.js';
import { findPlatformRoute, nextRouteStep } from './routeSearch.js';
import { targetScore } from './targetScoring.js';

export function buildWorld(bot, target, state) {
  const graph = platformGraph(state.map), current = nearestNode(graph, bot), goal = nearestNode(graph, target);
  const route = findPlatformRoute(graph, current.id, goal.id), step = nextRouteStep(graph, route);
  const clusters = state.fightClusters || buildFightClusters(state), nearest = nearestCluster(bot, clusters), hottest = hottestCluster(clusters);
  const fightCluster = { clusters, nearest, hottest, nearestDistance: nearest ? Math.hypot(bot.x - nearest.x, (bot.y - nearest.y) * 0.5) : 0 };
  const danger = stageDangerAt(bot.x, bot.y, state.map, current.p), wall = wallSense(bot, target, state.map);
  const combat = combatSense(bot, target), threat = threatAwareness(bot, target), motion = targetMotion(target);
  const prediction = humanPrediction(target, 24), objective = objectiveInfo(bot, state), hazard = nearestHazard(bot, state);
  const resourcePing = readResourcePing(bot, state), diveStunRush = readDiveStunPing(bot, state);
  const mapIntel = { mapAnalysis: state.map.analysis, mapZones: state.map.zones, mapPersonality: state.map.personality, flowGraph: graph };
  const partial = { state, map: state.map, target, current, goal, route, step, danger, wall, combat, threat, motion, prediction, hazard, objective, resourcePing, diveStunRush, fightCluster, ...mapIntel };
  const stageItem = nearestStageItem(bot, state, partial), edgePressureValue = edgePressure(bot, { ...partial, stageItem });
  const base = { ...partial, stageItem, edgePressure: edgePressureValue }, koPressure = killPressure(bot, base);
  const ledgeKill = ledgeKillPlan(bot, { ...base, koPressure }), koIntent = chooseKoIntent(bot, { ...base, koPressure, ledgeKill });
  const launchPlan = launchDirection(bot, { ...base, koPressure, ledgeKill, koIntent }, koIntent.name);
  const edgeCarry = edgeCarryPlan(bot, { ...base, koPressure, koIntent, launchPlan });
  const predGoal = predatorGoal(bot, { ...base, koPressure, koIntent, launchPlan, edgeCarry, ledgeKill });
  const rich = { ...base, koPressure, ledgeKill, koIntent, launchPlan, edgeCarry, predatorGoal: predGoal, graph };
  const pattern = updatePatternMemory(bot, target, rich), landing = predictLanding(target, state.map.platforms || []);
  const attackReputation = updateAttackReputation(bot, { ...rich, pattern, landing });
  const huntClock = bot.aiMind?.huntClock || bot.aiMind?.combatHeat?.hunt || null;
  const bestPlatform = bestPlatformValue(bot, { ...rich, graph, map: state.map }, landing);
  const withPlatform = { ...rich, pattern, landing, attackReputation, huntClock, bestPlatform };
  const antiWander = antiWanderLaw(bot, withPlatform), role = assignRole(bot, { ...withPlatform, antiWander });
  const dive = divePlan(bot, { ...withPlatform, antiWander, role });
  const platformDesire = platformDesireMap(bot, { ...withPlatform, antiWander, role, dive }), trap = landingTrap(bot, { ...withPlatform, platformDesire, dive });
  const pocket = combatPocket(bot, { ...withPlatform, platformDesire, landingTrap: trap, antiWander, role, dive });
  const tactic = combatTactic(bot, { ...withPlatform, platformDesire, landingTrap: trap, combatPocket: pocket, antiWander, role, dive });
  return { ...withPlatform, antiWander, role, dive, platformDesire, landingTrap: trap, combatPocket: pocket, combatTactic: tactic, platforms: state.map.platforms || [] };
}

export function chooseStableTarget(bot, fighters, map, state = null) {
  bot.aiMind ||= {};
  const rush = state ? readDiveStunPing(bot, state) : null;
  if (rush?.active && rush.victim) return rush.victim;
  const heat = bot.aiMind.combatHeat || {}, urgent = (heat.noDamageFrames || 0) > 180 || bot.aiMind.antiPeace?.active || bot.aiMind.huntClock?.active || state?.resourcePing;
  const held = fighters.find(f => f.id === bot.aiMind.targetId && !f.dead && !f.hidden && f !== bot);
  if (held && !urgent && (bot.aiMind.targetHold || 0) > 0) { bot.aiMind.targetHold--; return held; }
  const graph = platformGraph(map), botNode = nearestNode(graph, bot), clusters = state ? (state.fightClusters || buildFightClusters(state)) : null;
  let best = null, score = Infinity;
  for (const f of fighters) { if (f !== bot && !f.dead && !f.hidden) { const s = targetScore(bot, f, map, graph, botNode, nearestNode(graph, f), urgent, clusters); if (s < score) { best = f; score = s; } } }
  if (best) { bot.aiMind.targetId = best.id; bot.aiMind.targetHold = urgent ? 8 : 56; bot.aiMind.targetScore = Math.round(score); }
  return best;
}

function objectiveInfo(bot, state) { const o = state.objective; if (!o) return null; const d = Math.hypot(o.x - bot.x, (o.y - (bot.y - 90)) * 0.6); return { ...o, distance: d, score: Math.max(0, (o.value || 90) - d * 0.045 + (o.hold || 0) * 0.18) }; }
function nearestStageItem(bot, state, world) { let best = null, score = Infinity; for (const item of state.powerups || []) { if (!item.active) continue; const d = Math.hypot(item.x - bot.x, (item.y - bot.y) * 0.5), candidate = { ...item, distance: d }, value = powerupValue(bot, candidate, world), s = d - value * 3; if (s < score) { best = { ...candidate, score: value }; score = s; } } return best; }
function nearestHazard(bot, state) { let best = null, distance = Infinity; for (const h of state.hazards || []) { const d = Math.hypot(h.x - bot.x, h.y - (bot.y - 80)); if (d < distance) { best = { ...h, distance: d, danger: Math.max(0, h.radius + 80 - d) }; distance = d; } } return best; }
