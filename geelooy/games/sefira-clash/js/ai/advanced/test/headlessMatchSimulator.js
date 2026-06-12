import { createGameState } from '../../../core/state.js';
import { stepState } from '../../../core/loop.js';
import { createAttackIntentMetrics, observeAttackIntent } from './metrics/attackIntentMetrics.js';

/**
 * B"H
 * Headless simulator with honest KO and pressure metrics.
 *
 * Chapter 238: a corpse is not a new KO every frame, and silence after the war
 * ends is not cowardice. The scroll now counts stock-loss transitions and only
 * judges pressure while at least two fighters can still fight.
 */
export function simulateMatch(map, options = {}) {
  const started = Date.now();
  const frames = options.frames ?? 1800;
  const botCount = options.botCount ?? 5;
  const sampleEvery = options.sampleEvery ?? 60;
  const state = createGameState(map, botCount, options.character || {}, options.cosmetic || {});
  state.phase = 'playing';
  state.fastSim = !!options.fast;
  applyScenario(state, options.scenario);
  const input = options.input || neutralInput();
  const report = createReport(map, frames, botCount, options, state);
  for (let i = 0; i < frames; i++) {
    stepState(state, input);
    observeFrame(report, state);
    if (!options.fast && sampleEvery > 0 && i % sampleEvery === 0) sampleFrame(report, state);
    if (state.winner && options.stopOnWinner !== false) break;
  }
  finishReport(report, state, Date.now() - started);
  return report;
}

export function simulateMapSet(maps, options = {}) {
  return maps.map(map => simulateMatch(map, options));
}

export function assertHealthyReport(report) {
  const failures = [];
  const warnings = [];
  const edgeRatio = ratio(report.opportunities.EdgePressure || 0, total(report.opportunities));
  const pressureLimit = report.combatEnded ? Infinity : (report.options.noPressureLimit ?? 900);
  if (report.invalidAttackCommands > (report.options.invalidLimit ?? 5)) failures.push('invalid attacks');
  if (report.namelessJumps > 0) failures.push('nameless jumps');
  if (report.nanFighters > 0) failures.push('NaN fighter values');
  if (report.maxParticles > 260) failures.push('particle cap exceeded');
  if (!report.aiDriven) failures.push('AI did not drive every bot');
  if (edgeRatio > (report.options.edgeRatioLimit ?? 0.72)) failures.push('edge pressure dominance');
  if (report.longestNoPressureWindow > pressureLimit) failures.push('long no-pressure window');
  if (report.longestIdleNearEnemyWindow > (report.options.idleNearEnemyLimit ?? 120)) warnings.push('sustained idle near enemy');
  if (report.edgeBounceLoops > 0) warnings.push('edge bounce loop');
  if (report.damagePerMinute < 15 && !report.combatEnded) warnings.push('low damage');
  if (report.damageEnd <= 0 && report.framesRun >= 3000) warnings.push('zero damage');
  return { ok: failures.length === 0, failures, warnings, edgeRatio };
}

function createReport(map, frames, botCount, options, state) {
  return {
    map: map.id, options, requestedFrames: frames, botCount, framesRun: 0, winner: null,
    simMs: 0, framesPerSecond: 0, combatEnded: false, combatEndedAt: 0,
    lastStocks: Object.fromEntries(state.fighters.map(f => [f.id, f.stocks || 0])),
    attackCommands: 0, attackCommandsPerMinute: 0, activeAttackFrames: 0, rapidAttackCommands: 0, rapidAttackFrames: 0, charges: 0,
    jumps: 0, namelessJumps: 0, invalidAttackCommands: 0, idleNearEnemyFrames: 0, longestIdleNearEnemyWindow: 0, edgeBounceLoops: 0,
    rapidJailFrames: 0, rapidJailEscapes: 0, noStillnessCorrections: 0, frustrationActions: 0, antiPeaceFrames: 0, antiPeaceActivations: 0,
    comboMomentumFrames: 0, comboMomentumActivations: 0, killModeFrames: 0, forceEngageFrames: 0, hungerFrames: 0,
    starvingFrames: 0, revengeSwitches: 0, fakeRetreatFrames: 0, fakeRetreatActivations: 0, executionFrames: 0,
    threatDodgeFrames: 0, jumpDebtBlocks: 0, highJumpDebtFrames: 0, recoveries: 0, escapes: 0, hiddenRespawns: 0,
    itemsSpawned: 0, itemsPickedUp: 0, hazardsSpawned: 0, hazardHits: 0, objectiveSpawns: 0, objectiveClaims: 0,
    scarCount: 0, stageBornPowerups: 0, stageMood: null, storyBeats: 0, storyCallouts: {}, rivalryPairs: 0,
    attackIntent: createAttackIntentMetrics(),
    maxParticles: 0, nanFighters: 0, aiDriven: true, damageEnd: 0, damagePerMinute: 0, koCount: 0,
    loopDetectedFrames: 0, opportunityFatigueTriggers: 0, longestNoPressureWindow: 0, currentNoPressureWindow: 0,
    longestSameOpportunityWindow: 0, sameOpportunityWindow: {}, frameHadPressure: false, states: {}, opportunities: {}, intents: {},
    humanIntents: {}, commitments: {}, attackReasons: {}, jumpReasons: {}, samples: []
  };
}

function observeFrame(report, state) {
  report.framesRun = state.frame;
  report.maxParticles = Math.max(report.maxParticles, state.particles.length);
  report.frameHadPressure = false;
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

function observeStockLosses(report, state) {
  for (const f of state.fighters) {
    const prev = report.lastStocks[f.id] ?? f.stocks ?? 0;
    const now = f.stocks || 0;
    if (now < prev) report.koCount += prev - now;
    report.lastStocks[f.id] = now;
  }
}

function activeFighters(state) {
  return state.fighters.filter(f => !f.dead && !f.hidden && (f.stocks || 0) > 0);
}

function observeBot(report, f) {
  const mind = f.aiMind;
  if (!mind?.state) report.aiDriven = false;
  const opportunity = mind?.opportunity?.name || 'none';
  const intent = mind?.opportunity?.intent || 'none';
  const humanIntent = mind?.humanIntent?.name || 'none';
  count(report.states, mind?.state || 'none');
  count(report.opportunities, opportunity);
  count(report.intents, intent);
  count(report.humanIntents, humanIntent);
  count(report.commitments, mind?.commitment?.name || 'none');
  count(report.attackReasons, mind?.attackCheck?.reason || 'none');
  count(report.jumpReasons, mind?.jumpReason || 'none');
  observeAttackIntent(report, mind);
  updateSameOpportunity(report, f.id, opportunity);
  observeMindMetrics(report, mind, f, humanIntent);
  if (f.input?.jump) observeJump(report, mind);
  if (issuedAttackCommand(f)) observeAttackCommand(report, mind);
  if (f.attack) { report.activeAttackFrames++; report.frameHadPressure = true; }
  if (f.input?.rapidPunch) report.rapidAttackCommands++;
  if (f.rapidAttack) { report.rapidAttackFrames++; report.frameHadPressure = true; }
  if (f.input?.chargePunch || f.input?.chargeKick) report.charges++;
  if (mind?.state?.startsWith('Recover')) report.recoveries++;
  if (mind?.state?.startsWith('Escape')) report.escapes++;
}

function observeMindMetrics(report, mind, fighter, humanIntent) {
  const idleWindow = mind?.positionLoop?.idleNearEnemyFrames || 0;
  if (mind?.positionLoop?.loopDetected) report.loopDetectedFrames++;
  if (idleWindow > 0) report.idleNearEnemyFrames++;
  report.longestIdleNearEnemyWindow = Math.max(report.longestIdleNearEnemyWindow, idleWindow);
  if (mind?.positionLoop?.edgeBounceFrames > 120) report.edgeBounceLoops++;
  if (mind?.noStillness?.mustMove) report.noStillnessCorrections++;
  if (mind?.frustration?.frustrated) report.frustrationActions++;
  if (mind?.opportunity?.fatigue?.stale) report.opportunityFatigueTriggers++;
  if (mind?.antiPeace?.active) report.antiPeaceFrames++;
  if (mind?.antiPeace?.activations) report.antiPeaceActivations = Math.max(report.antiPeaceActivations, mind.antiPeace.activations);
  if (mind?.comboMomentum?.active) report.comboMomentumFrames++;
  if (mind?.comboMomentum?.activations) report.comboMomentumActivations = Math.max(report.comboMomentumActivations, mind.comboMomentum.activations);
  if (mind?.combatHeat?.killMode) report.killModeFrames++;
  if (mind?.combatHeat?.forceEngage) report.forceEngageFrames++;
  if (mind?.hunger?.hungry) report.hungerFrames++;
  if (mind?.hunger?.starving) report.starvingFrames++;
  if (mind?.revenge?.switches) report.revengeSwitches = Math.max(report.revengeSwitches, mind.revenge.switches);
  if (mind?.fakeRetreat?.active) report.fakeRetreatFrames++;
  if (mind?.fakeRetreat?.activations) report.fakeRetreatActivations = Math.max(report.fakeRetreatActivations, mind.fakeRetreat.activations);
  if (mind?.execution?.active || humanIntent === 'FinishStock') report.executionFrames++;
  if (humanIntent === 'AvoidHit') report.threatDodgeFrames++;
  if (mind?.jumpDebt?.blocks) report.jumpDebtBlocks = Math.max(report.jumpDebtBlocks, mind.jumpDebt.blocks);
  if (mind?.jumpDebt?.high) report.highJumpDebtFrames++;
  if (fighter.rapidJail?.active) report.rapidJailFrames++;
  if (fighter.rapidJail?.escapes) report.rapidJailEscapes = Math.max(report.rapidJailEscapes, fighter.rapidJail.escapes);
}

function observeJump(report, mind) { report.jumps++; if (mind?.jumpReason === 'None' || mind?.jumpReason === 'noReason') report.namelessJumps++; }
function observeAttackCommand(report, mind) { report.attackCommands++; report.frameHadPressure = true; if (mind?.attackCheck?.valid === false) report.invalidAttackCommands++; }
function updateNoPressureWindow(report) { if (report.frameHadPressure) report.currentNoPressureWindow = 0; else report.currentNoPressureWindow++; report.longestNoPressureWindow = Math.max(report.longestNoPressureWindow, report.currentNoPressureWindow); }
function updateSameOpportunity(report, id, opportunity) { const slot = report.sameOpportunityWindow[id] ||= { name: '', frames: 0 }; if (slot.name === opportunity) slot.frames++; else { slot.name = opportunity; slot.frames = 1; } report.longestSameOpportunityWindow = Math.max(report.longestSameOpportunityWindow, slot.frames); }
function sampleFrame(report, state) { if (report.samples.length > 240) return; report.samples.push({ frame: state.frame, fighters: state.fighters.map(sampleFighter) }); }
function sampleFighter(f) { return { id: f.id, human: f.human, dead: f.dead, hidden: !!f.hidden, x: Math.round(f.x), y: Math.round(f.y), vx: round(f.vx), vy: round(f.vy), damage: Math.round(f.damage), stocks: f.stocks, state: f.aiMind?.state || null, opportunity: f.aiMind?.opportunity?.name || null, koIntent: f.aiMind?.debug?.koIntent || null, attackFamily: f.aiMind?.debug?.attackFamily || null }; }

function finishReport(report, state, simMs) {
  report.simMs = simMs;
  report.framesPerSecond = Math.round(report.framesRun / Math.max(0.001, simMs / 1000));
  report.winner = state.winner || null;
  report.alive = activeFighters(state).length;
  report.damageEnd = Math.round(state.fighters.reduce((sum, f) => sum + (f.damage || 0), 0));
  report.damagePerMinute = Math.round(report.damageEnd / Math.max(1, report.framesRun / 3600));
  report.attackCommandsPerMinute = Math.round(report.attackCommands / Math.max(1, report.framesRun / 3600));
  report.itemsSpawned = state.stageDirector?.itemsSpawned || 0;
  report.itemsPickedUp = state.stageDirector?.itemsPickedUp || 0;
  report.hazardsSpawned = state.stageDirector?.hazardsSpawned || 0;
  report.hazardHits = state.stageDirector?.hazardHits || 0;
  report.objectiveSpawns = state.stageDirector?.objectiveSpawns || 0;
  report.objectiveClaims = state.stageDirector?.objectiveClaims || 0;
  report.scarCount = state.scars?.length || 0;
  report.stageBornPowerups = (state.powerups || []).filter(p => p.stageBorn).length;
  report.stageMood = state.stageMood;
  report.storyBeats = state.story?.beats || 0;
  report.storyCallouts = state.story?.callouts || {};
  report.rivalryPairs = Object.keys(state.story?.rivalHits || {}).length;
  report.finalStocks = state.fighters.map(f => ({ id: f.id, human: f.human, stocks: f.stocks, damage: Math.round(f.damage), dead: f.dead }));
  report.health = assertHealthyReport(report);
  delete report.lastStocks;
}

function applyScenario(state, scenario) {
  if (!scenario) return;
  if (scenario === 'edgeHuman') return edgeHuman(state);
  if (scenario === 'chargingHuman') return chargingHuman(state);
  if (scenario === 'rapidJail') return rapidJail(state);
  if (typeof scenario === 'function') scenario(state);
}

function edgeHuman(state) { const hero = state.fighters.find(f => f.human); const p = state.map.platforms?.[0]; if (!hero || !p) return; hero.x = p.x + p.w - 95; hero.y = p.y; hero.vx = 0; hero.grounded = true; hero.damage = 110; }
function chargingHuman(state) { const hero = state.fighters.find(f => f.human); const bot = state.fighters.find(f => !f.human); if (!hero || !bot) return; hero.x = bot.x - 120; hero.y = bot.y; hero.face = 1; hero.charge ||= {}; hero.charge.punch = 35; hero.chargeGlow = 0.7; }
function rapidJail(state) { const hero = state.fighters.find(f => f.human); const bot = state.fighters.find(f => !f.human); if (!hero || !bot) return; hero.x = bot.x + 64; hero.y = bot.y; hero.grounded = true; hero.rapidJail = { active: true, recentHits: 8, attackerId: bot.id, frames: 120, escapeX: 1, escapes: 0 }; hero.stun = 55; }
function issuedAttackCommand(f) { return !!(f.input?.punch || f.input?.kick || f.input?.grab || f.input?.rapidPunch); }
function neutralInput() { return { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false }; }
function count(bucket, key) { bucket[key] = (bucket[key] || 0) + 1; }
function ratio(value, totalValue) { return totalValue ? value / totalValue : 0; }
function total(bucket) { return Object.values(bucket).reduce((sum, value) => sum + value, 0); }
function round(value) { return Math.round((value || 0) * 10) / 10; }
