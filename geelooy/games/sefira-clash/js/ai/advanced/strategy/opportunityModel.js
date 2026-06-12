import { applyAggression } from './aggressionEscalation.js';
import { antiPeaceScoreBonus } from './antiPeace.js';
import { chooseEngagementIntent, intentScoreBoost } from './engagementIntent.js';
import { applyOpportunityFatigue, updateOpportunityFatigue } from './opportunityFatigue.js';
import { scoreOpportunityProgress } from './opportunityProgress.js';
import { loopPenalty } from '../memory/positionLoopMemory.js';
import { objectiveClaimPlan } from '../objectives/objectiveClaimPlan.js';
import { edgeCarryPenalty, updateEdgeCarryMemory } from '../edge/edgeCarryMemory.js';

/** B"H - Opportunity model with dive-stun rush priority. */
export function chooseOpportunity(bot, world, attackCheck) {
  const intent = world.humanIntent?.name || chooseEngagementIntent(world, { name: 'Chase' }, attackCheck);
  const raw = scoreOpportunities(bot, world, attackCheck, intent);
  world.objectivePlan = objectiveClaimPlan(bot, world, raw);
  boostByRole(raw, world);
  if (world.objectivePlan.active) raw.ObjectiveChase = Math.max(raw.ObjectiveChase || 0, world.objectivePlan.value);
  const fatigue = updateOpportunityFatigue(bot, world, raw);
  const tired = applyOpportunityFatigue(raw, fatigue);
  const looped = applyLoopPenalties(bot, applyAggression(tired, world.aggression));
  const winner = Object.entries(looped).sort((a, b) => b[1] - a[1])[0];
  updateEdgeCarryMemory(bot, world, winner?.[0] === 'EdgeCarry');
  return { name: winner[0], score: winner[1], scores: looped, rawScores: raw, fatigue, intent: world.humanIntent?.name || chooseEngagementIntent(world, { name: winner[0] }, attackCheck) };
}

export function scoreOpportunities(bot, world, attackCheck, intent) {
  if (attackCheck.valid && !world.dive?.active && !world.diveStunRush?.active) return fixed('GuaranteedAttack');
  const progress = scoreOpportunityProgress(bot, world);
  const bonus = mergeBonuses(intentScoreBoost(intent), antiPeaceScoreBonus(world), humanBonus(world, intent));
  return { GuaranteedAttack: attackCheck.valid ? 1000 : 0, DiveStunRush: rushScore(world), DiveCrush: diveScore(world), HorizontalKill: horizontalKillScore(world), VerticalKill: verticalKillScore(world), EdgeGuard: edgeGuardScore(world), EdgeCarry: edgeCarryScore(bot, world), LandingIntercept: landingScore(bot, world) + progress.landing + (bonus.LandingIntercept || 0), EdgePressure: Math.max(0, edgeScore(world) + progress.edge + (bonus.EdgePressure || 0)), CenterControl: Math.max(0, centerScore(bot, world) + (bonus.CenterControl || 0)), ItemChase: Math.max(0, itemScore(world) + (bonus.ItemChase || 0)), ObjectiveChase: Math.max(0, objectiveScore(world) + (bonus.ObjectiveChase || 0)), Chase: Math.max(20, progress.chase + clusterScore(bot, world) + (bonus.Chase || 0)) };
}

function boostByRole(raw, w) {
  const role = w.role?.name;
  if (role === 'Hunter' || role === 'AntiAir') raw.DiveCrush += 90;
  if (w.diveStunRush?.active) raw.DiveStunRush += role === 'Survivor' ? 70 : 135;
  if (role === 'ResourceRunner') raw.ObjectiveChase += 85;
  if (role === 'Denier') raw.ItemChase += 75;
  if (role === 'EdgeGuard') raw.EdgeGuard += 42;
  if (role === 'AntiAir') raw.VerticalKill += 34;
  if (role === 'CenterControl') raw.CenterControl += 54;
  if (w.antiWander?.active) raw.Chase += 72;
}
function rushScore(w) { return w.diveStunRush?.active ? 260 + w.diveStunRush.value : 0; }
function diveScore(w) { return w.dive?.active ? w.dive.score + 75 + (w.target.blocking ? 45 : 0) + (w.target.stun > 0 ? 38 : 0) + (w.combatHeat?.killMode ? 42 : 0) : 0; }
function fixed(name) { return { GuaranteedAttack: name === 'GuaranteedAttack' ? 1000 : 0, DiveStunRush: 0, DiveCrush: 0, HorizontalKill: 0, VerticalKill: 0, EdgeGuard: 0, EdgeCarry: 0, LandingIntercept: 0, EdgePressure: 0, CenterControl: 0, ItemChase: 0, ObjectiveChase: 0, Chase: 0 }; }
function horizontalKillScore(w) { return w.koIntent?.name === 'HorizontalKill' ? 100 + (w.koPressure?.side || 0) * 0.45 : 0; }
function verticalKillScore(w) { return ['VerticalKill', 'AntiAirKill'].includes(w.koIntent?.name) ? 78 + (w.koPressure?.up || 0) * 0.3 : 0; }
function edgeGuardScore(w) { return w.ledgeKill?.active && w.ledgeKill?.read?.offstage ? 74 + (w.ledgeKill.score || 0) * 0.42 : 0; }
function edgeCarryScore(bot, w) { if (!w.edgeCarry?.active) return 0; const p = w.target.damage || 0; const cap = p > 120 ? 78 : p > 85 ? 54 : 28; return Math.min(cap, Math.max(0, 30 + (w.edgeCarry.score || 0) * 0.22 + (w.koPressure?.carry || 0) * 0.1 - edgeCarryPenalty(bot))); }
function itemScore(w) { const i = w.stageItem; if (!i || w.threatVision?.panic || w.hazard?.danger > 35) return 0; if ((i.distance || 999) > 760 && !w.huntClock?.active && !w.resourcePing?.active) return 0; return Math.max(0, (i.score || 0) + (i.stageBorn ? 48 : 12) + (w.resourcePing?.type === 'item' ? w.resourcePing.value : 0)); }
function objectiveScore(w) { const o = w.objective; if (!o || w.threatVision?.panic || w.hazard?.danger > 40) return 0; if ((o.distance || 999) > 1040 && !w.huntClock?.active && !w.resourcePing?.active) return 0; return Math.max(0, (o.score || 0) + (w.stageMood?.objectiveBias || 0) + (w.resourcePing?.type === 'objective' ? w.resourcePing.value : 0)); }
function landingScore(bot, w) { if (!w.landing?.active) return 0; const d = Math.hypot(w.landing.x - bot.x, (w.landing.y - bot.y) * 0.45); return Math.max(0, 76 - d * 0.05 + (w.pattern?.jumpRate || 0) * 14 + (w.combatHeat?.killMode ? 24 : 0)); }
function edgeScore(w) { const base = (w.edgePressure?.score || 0) * 48 + (w.pattern?.edgeRetreatRate || 0) * 12; return Math.max(0, base + (w.combatHeat?.killMode ? 28 : 0) - ((w.edgePressure?.distance ?? 999) > 260 ? 36 : 0)); }
function centerScore(bot, w) { if (w.combat?.canHitNow || w.antiPeace?.active || w.hunger?.starving || w.koPressure?.lethal) return 0; return Math.max(0, (w.mapPersonality?.objectivePressure || 4) * 8 - Math.abs(bot.x - ((w.map.bounds.left + w.map.bounds.right) / 2)) * 0.015); }
function clusterScore(bot, w) { const c = w.fightCluster?.hottest; if (!c) return 0; const d = Math.hypot(bot.x - c.x, (bot.y - c.y) * 0.5); return Math.max(0, 70 - d * 0.035 + c.heat * 0.15); }
function humanBonus(w, intent) { return { FinishStock: { HorizontalKill: 80, VerticalKill: 54, EdgeGuard: 42, EdgeCarry: 6, DiveCrush: 80, DiveStunRush: 80 }, ReachHim: { Chase: w.hunger?.starving ? 72 : 32, ObjectiveChase: 18, DiveCrush: 70, DiveStunRush: 90 }, EscapeEdge: { Chase: 44, EdgePressure: -55, CenterControl: 22, EdgeCarry: -35, DiveCrush: 35 }, AvoidHit: { Chase: 10, ItemChase: -50, ObjectiveChase: -50, EdgeCarry: -45 } }[intent] || {}; }
function mergeBonuses(...bonuses) { const out = {}; for (const b of bonuses) for (const [k, v] of Object.entries(b || {})) out[k] = (out[k] || 0) + v; return out; }
function applyLoopPenalties(bot, scores) { const out = { ...scores }; for (const key of Object.keys(out)) out[key] = Math.max(0, out[key] - loopPenalty(bot, key)); return out; }
