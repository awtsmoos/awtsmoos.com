import { activeFighters } from './ReportFinish.js';
import { observeAttackIntent } from '../metrics/attackIntentMetrics.js';

/** B"H — every frame is cross-examined: pressure, damage, intent, silence. */
export function observeFrame(report, state) {
  report.framesRun = state.frame;
  report.maxParticles = Math.max(report.maxParticles, state.particles.length);
  report.frameHadPressure = false;
  observeDamage(report, state);
  observeStockLosses(report, state);
  const fighting = activeFighters(state).length > 1;
  if (!fighting && !report.combatEnded) { report.combatEnded = true; report.combatEndedAt = state.frame; }
  for (const f of state.fighters) {
    if (Number.isNaN(f.x) || Number.isNaN(f.y)) report.nanFighters++;
    if (f.hidden && !f.dead) report.hiddenRespawns++;
    if (f.human || f.dead || f.hidden) continue;
    observeBot(report, f);
  }
  if (fighting) updateNoPressureWindow(report);
}

function observeDamage(report, state) {
  const current = state.fighters.reduce((sum, f) => sum + (f.damage || 0), 0);
  report.peakDamage = Math.max(report.peakDamage, Math.round(current));
  if (current > 0) report.damageFrames++;
}

function observeStockLosses(report, state) {
  for (const f of state.fighters) {
    const prev = report.lastStocks[f.id] ?? f.stocks ?? 0;
    const now = f.stocks || 0;
    if (now < prev) report.koCount += prev - now;
    report.lastStocks[f.id] = now;
  }
}

function observeBot(report, f) {
  const mind = f.aiMind;
  if (!mind?.state) report.aiDriven = false;
  const opportunity = mind?.opportunity?.name || 'none';
  count(report.states, mind?.state || 'none');
  count(report.opportunities, opportunity);
  count(report.intents, mind?.opportunity?.intent || 'none');
  count(report.humanIntents, mind?.humanIntent?.name || 'none');
  count(report.commitments, mind?.commitment?.name || 'none');
  count(report.attackReasons, mind?.attackCheck?.reason || 'none');
  count(report.jumpReasons, mind?.jumpReason || 'none');
  observeAttackIntent(report, mind);
  updateSameOpportunity(report, f.id, opportunity);
  observeMindMetrics(report, mind, f);
  if (f.input?.jump) observeJump(report, mind);
  if (issuedAttackCommand(f)) observeAttackCommand(report, mind);
  if (f.attack) { report.activeAttackFrames++; report.frameHadPressure = true; }
  if (f.input?.rapidPunch) report.rapidAttackCommands++;
  if (f.rapidAttack) { report.rapidAttackFrames++; report.frameHadPressure = true; }
  if (f.input?.chargePunch || f.input?.chargeKick) report.charges++;
  if (mind?.state?.startsWith('Recover')) report.recoveries++;
  if (mind?.state?.startsWith('Escape')) report.escapes++;
}

function observeMindMetrics(report, mind, fighter) {
  const idleWindow = mind?.positionLoop?.idleNearEnemyFrames || 0;
  const humanIntent = mind?.humanIntent?.name || 'none';
  if (mind?.positionLoop?.loopDetected) report.loopDetectedFrames++;
  if (idleWindow > 0) report.idleNearEnemyFrames++;
  report.longestIdleNearEnemyWindow = Math.max(report.longestIdleNearEnemyWindow, idleWindow);
  if (mind?.positionLoop?.edgeBounceFrames > 120) report.edgeBounceLoops++;
  if (mind?.noStillness?.mustMove) report.noStillnessCorrections++;
  if (mind?.frustration?.frustrated) report.frustrationActions++;
  if (mind?.opportunity?.fatigue?.stale) report.opportunityFatigueTriggers++;
  if (mind?.antiPeace?.active) report.antiPeaceFrames++;
  if (mind?.comboMomentum?.active) report.comboMomentumFrames++;
  if (mind?.combatHeat?.killMode) report.killModeFrames++;
  if (mind?.combatHeat?.forceEngage) report.forceEngageFrames++;
  if (mind?.hunger?.hungry) report.hungerFrames++;
  if (mind?.hunger?.starving) report.starvingFrames++;
  if (mind?.fakeRetreat?.active) report.fakeRetreatFrames++;
  if (mind?.execution?.active || humanIntent === 'FinishStock') report.executionFrames++;
  if (humanIntent === 'AvoidHit') report.threatDodgeFrames++;
  if (mind?.jumpDebt?.blocks) report.jumpDebtBlocks = Math.max(report.jumpDebtBlocks, mind.jumpDebt.blocks);
  if (mind?.jumpDebt?.high) report.highJumpDebtFrames++;
  if (fighter.rapidJail?.active) report.rapidJailFrames++;
  maxMindCounters(report, mind, fighter);
}

function maxMindCounters(report, mind, fighter) {
  if (mind?.antiPeace?.activations) report.antiPeaceActivations = Math.max(report.antiPeaceActivations, mind.antiPeace.activations);
  if (mind?.comboMomentum?.activations) report.comboMomentumActivations = Math.max(report.comboMomentumActivations, mind.comboMomentum.activations);
  if (mind?.revenge?.switches) report.revengeSwitches = Math.max(report.revengeSwitches, mind.revenge.switches);
  if (mind?.fakeRetreat?.activations) report.fakeRetreatActivations = Math.max(report.fakeRetreatActivations, mind.fakeRetreat.activations);
  if (fighter.rapidJail?.escapes) report.rapidJailEscapes = Math.max(report.rapidJailEscapes, fighter.rapidJail.escapes);
}

function observeJump(report, mind) { report.jumps++; if (mind?.jumpReason === 'None' || mind?.jumpReason === 'noReason') report.namelessJumps++; }
function observeAttackCommand(report, mind) { report.attackCommands++; report.frameHadPressure = true; if (mind?.attackCheck?.valid === false) report.invalidAttackCommands++; }
function updateNoPressureWindow(report) { if (report.frameHadPressure) report.currentNoPressureWindow = 0; else report.currentNoPressureWindow++; report.longestNoPressureWindow = Math.max(report.longestNoPressureWindow, report.currentNoPressureWindow); }
function updateSameOpportunity(report, id, opportunity) { const slot = report.sameOpportunityWindow[id] ||= { name: '', frames: 0 }; if (slot.name === opportunity) slot.frames++; else { slot.name = opportunity; slot.frames = 1; } report.longestSameOpportunityWindow = Math.max(report.longestSameOpportunityWindow, slot.frames); }
function issuedAttackCommand(f) { return !!(f.input?.punch || f.input?.kick || f.input?.grab || f.input?.rapidPunch); }
function count(bucket, key) { bucket[key] = (bucket[key] || 0) + 1; }
