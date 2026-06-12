import { applyAggression } from './aggressionEscalation.js';
import { antiPeaceScoreBonus } from './antiPeace.js';
import { chooseEngagementIntent, intentScoreBoost } from './engagementIntent.js';
import { applyOpportunityFatigue, updateOpportunityFatigue } from './opportunityFatigue.js';
import { scoreOpportunityProgress } from './opportunityProgress.js';
import { loopPenalty } from '../memory/positionLoopMemory.js';

/**
 * B"H
 * Opportunity model with sharper cliff violence.
 *
 * Chapter 227: horizontal kill and edge carry now outrank vague ledgeguarding
 * while the target is still onstage. The bot prepares the push, owns the inside
 * shoulder, and only becomes an edgeguarder after true exile.
 */
export function chooseOpportunity(bot, world, attackCheck) {
  const intent = world.humanIntent?.name || chooseEngagementIntent(world, { name: 'Chase' }, attackCheck);
  const raw = scoreOpportunities(bot, world, attackCheck, intent);
  const fatigue = updateOpportunityFatigue(bot, world, raw);
  const tired = applyOpportunityFatigue(raw, fatigue);
  const aggressive = applyAggression(tired, world.aggression);
  const looped = applyLoopPenalties(bot, aggressive);
  const winner = Object.entries(looped).sort((a, b) => b[1] - a[1])[0];
  const finalIntent = world.humanIntent?.name || chooseEngagementIntent(world, { name: winner[0] }, attackCheck);
  return { name: winner[0], score: winner[1], scores: looped, rawScores: raw, fatigue, intent: finalIntent };
}

export function scoreOpportunities(bot, world, attackCheck, intent) {
  if (attackCheck.valid) return fixed('GuaranteedAttack');
  const progress = scoreOpportunityProgress(bot, world);
  const bonus = mergeBonuses(intentScoreBoost(intent), antiPeaceScoreBonus(world), humanBonus(world, intent));
  return {
    GuaranteedAttack: 0,
    HorizontalKill: horizontalKillScore(world),
    VerticalKill: verticalKillScore(world),
    EdgeGuard: edgeGuardScore(world),
    EdgeCarry: edgeCarryScore(world),
    LandingIntercept: landingScore(bot, world) + progress.landing + (bonus.LandingIntercept || 0),
    EdgePressure: Math.max(0, edgeScore(world) + progress.edge + (bonus.EdgePressure || 0)),
    CenterControl: Math.max(0, centerScore(bot, world) + (bonus.CenterControl || 0)),
    ItemChase: Math.max(0, itemScore(world) + (bonus.ItemChase || 0)),
    ObjectiveChase: Math.max(0, objectiveScore(world) + (bonus.ObjectiveChase || 0)),
    Chase: Math.max(20, progress.chase + (bonus.Chase || 0))
  };
}

function humanBonus(world, intent) {
  return {
    AvoidHit: { Chase: 10, CenterControl: -30, EdgePressure: -20, ItemChase: -70, ObjectiveChase: -70, EdgeCarry: -25 },
    FinishStock: { EdgePressure: 45, LandingIntercept: 22, Chase: 16, HorizontalKill: 72, VerticalKill: 50, EdgeGuard: 38, EdgeCarry: 40, ItemChase: -35, ObjectiveChase: -25 },
    ReachHim: { Chase: world.hunger?.starving ? 70 : 32, LandingIntercept: 12, EdgeCarry: 22 },
    CrossUp: { Chase: 45, CenterControl: -25, EdgeCarry: 28, HorizontalKill: 18 },
    RetreatBait: { Chase: 18, EdgePressure: -16, ItemChase: -15 },
    EscapeEdge: { Chase: 40, EdgePressure: -55, CenterControl: 18, ItemChase: -30, ObjectiveChase: -30 },
    HitHim: { Chase: 0 }
  }[intent] || {};
}

function fixed(name) {
  return { GuaranteedAttack: name === 'GuaranteedAttack' ? 1000 : 0, HorizontalKill: 0, VerticalKill: 0, EdgeGuard: 0, EdgeCarry: 0, LandingIntercept: 0, EdgePressure: 0, CenterControl: 0, ItemChase: 0, ObjectiveChase: 0, Chase: 0 };
}

function horizontalKillScore(world) {
  if (world.koIntent?.name !== 'HorizontalKill') return 0;
  return 96 + (world.koPressure?.side || 0) * 0.42 + (world.edgeCarry?.score || 0) * 0.18;
}

function verticalKillScore(world) {
  return ['VerticalKill', 'AntiAirKill'].includes(world.koIntent?.name) ? 74 + (world.koPressure?.up || 0) * 0.28 : 0;
}

function edgeGuardScore(world) {
  if (!world.ledgeKill?.active || !world.ledgeKill?.read?.offstage) return 0;
  return 70 + (world.ledgeKill.score || 0) * 0.4;
}

function edgeCarryScore(world) {
  return world.edgeCarry?.active ? Math.max(0, 64 + (world.edgeCarry.score || 0) * 0.42 + (world.koPressure?.carry || 0) * 0.25) : 0;
}

function itemScore(world) {
  const item = world.stageItem;
  if (!item || world.threatVision?.panic || world.hazard?.danger > 30) return 0;
  if ((item.distance || 999) > 520) return 0;
  return Math.max(0, (item.score || 0) + (item.stageBorn ? 24 : 6));
}

function objectiveScore(world) {
  const objective = world.objective;
  if (!objective || world.threatVision?.panic || world.hazard?.danger > 30) return 0;
  if ((objective.distance || 999) > 620) return 0;
  return Math.max(0, (objective.score || 0) + 20);
}

function landingScore(bot, world) {
  if (!world.landing?.active) return 0;
  const d = Math.hypot(world.landing.x - bot.x, (world.landing.y - bot.y) * 0.45);
  const habit = world.pattern?.jumpRate || 0;
  const kill = world.execution?.active || world.combatHeat?.killMode || world.koIntent?.killReady ? 24 : 0;
  return Math.max(0, 76 - d * 0.05 + habit * 14 + kill);
}

function edgeScore(world) {
  const habit = world.pattern?.edgeRetreatRate || 0;
  const base = world.edgePressure?.score * 48 + habit * 12;
  const distance = world.edgePressure?.distance ?? 999;
  const closeBonus = distance < 170 && (world.combatHeat?.killMode || world.execution?.active || world.koIntent?.killReady) ? 48 : 0;
  const farPenalty = distance > 240 ? 42 : 0;
  return Math.max(0, base + closeBonus - farPenalty);
}

function centerScore(bot, world) {
  if (world.combat?.canHitNow || world.antiPeace?.active || world.combatHeat?.forceEngage || world.hunger?.starving || world.koPressure?.lethal) return 0;
  if (bot.damage < 80 && !world.pressure?.low) return 7;
  const center = (world.map.bounds.left + world.map.bounds.right) / 2;
  return Math.max(0, 38 - Math.abs(bot.x - center) * 0.018);
}

function mergeBonuses(...bonuses) {
  const out = {};
  for (const bonus of bonuses) for (const [key, value] of Object.entries(bonus || {})) out[key] = (out[key] || 0) + value;
  return out;
}

function applyLoopPenalties(bot, scores) {
  const out = { ...scores };
  for (const key of Object.keys(out)) out[key] = Math.max(0, out[key] - loopPenalty(bot, key));
  return out;
}
