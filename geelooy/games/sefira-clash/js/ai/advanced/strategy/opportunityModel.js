import { applyAggression } from './aggressionEscalation.js';
import { antiPeaceScoreBonus } from './antiPeace.js';
import { chooseEngagementIntent, intentScoreBoost } from './engagementIntent.js';
import { applyOpportunityFatigue, updateOpportunityFatigue } from './opportunityFatigue.js';
import { scoreOpportunityProgress } from './opportunityProgress.js';
import { loopPenalty } from '../memory/positionLoopMemory.js';

/**
 * B"H
 * Opportunity model with violence escalation and stability law.
 *
 * Chapter 81: guaranteed hit remains king. After that, combo, kill, and
 * anti-peace intent may bend the scores toward collision, but no score can make
 * the bot press an invalid attack.
 */
export function chooseOpportunity(bot, world, attackCheck) {
  const intent = chooseEngagementIntent(world, { name: 'Chase' }, attackCheck);
  const raw = scoreOpportunities(bot, world, attackCheck, intent);
  const fatigue = updateOpportunityFatigue(bot, world, raw);
  const tired = applyOpportunityFatigue(raw, fatigue);
  const aggressive = applyAggression(tired, world.aggression);
  const looped = applyLoopPenalties(bot, aggressive);
  const winner = Object.entries(looped).sort((a, b) => b[1] - a[1])[0];
  const finalIntent = chooseEngagementIntent(world, { name: winner[0] }, attackCheck);
  return { name: winner[0], score: winner[1], scores: looped, rawScores: raw, fatigue, intent: finalIntent };
}

export function scoreOpportunities(bot, world, attackCheck, intent) {
  if (attackCheck.valid) return fixed('GuaranteedAttack');
  const progress = scoreOpportunityProgress(bot, world);
  const bonus = mergeBonuses(intentScoreBoost(intent), antiPeaceScoreBonus(world));
  return {
    GuaranteedAttack: 0,
    LandingIntercept: landingScore(bot, world) + progress.landing + (bonus.LandingIntercept || 0),
    EdgePressure: Math.max(0, edgeScore(world) + progress.edge + (bonus.EdgePressure || 0)),
    CenterControl: Math.max(0, centerScore(bot, world) + (bonus.CenterControl || 0)),
    Chase: Math.max(20, progress.chase + (bonus.Chase || 0))
  };
}

function fixed(name) {
  return { GuaranteedAttack: name === 'GuaranteedAttack' ? 1000 : 0, LandingIntercept: 0, EdgePressure: 0, CenterControl: 0, Chase: 0 };
}

function landingScore(bot, world) {
  if (!world.landing?.active) return 0;
  const d = Math.hypot(world.landing.x - bot.x, (world.landing.y - bot.y) * 0.45);
  const habit = world.pattern?.jumpRate || 0;
  const kill = world.combatHeat?.killMode ? 18 : 0;
  return Math.max(0, 76 - d * 0.05 + habit * 14 + kill);
}

function edgeScore(world) {
  const habit = world.pattern?.edgeRetreatRate || 0;
  const base = world.edgePressure?.score * 52 + habit * 12;
  const distance = world.edgePressure?.distance ?? 999;
  const closeBonus = distance < 170 && world.combatHeat?.killMode ? 34 : 0;
  const farPenalty = distance > 240 ? 42 : 0;
  return Math.max(0, base + closeBonus - farPenalty);
}

function centerScore(bot, world) {
  if (world.combat?.canHitNow || world.antiPeace?.active || world.combatHeat?.forceEngage) return 0;
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
