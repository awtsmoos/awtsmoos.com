import { createGameState } from '../../../core/state.js';
import { stepState } from '../../../core/loop.js';

/**
 * B"H
 * Headless match simulator for the unified advanced AI.
 *
 * Chapter 87: the scroll now measures violence itself: heat, kill mode,
 * anti-peace, combo momentum, force engagement, commands per minute, and quiet
 * maps that still refuse to bleed.
 */
export function simulateMatch(map, options = {}) {
  const frames = options.frames ?? 1800;
  const botCount = options.botCount ?? 5;
  const sampleEvery = options.sampleEvery ?? 60;
  const state = createGameState(map, botCount, options.character || {}, options.cosmetic || {});
  state.phase = 'playing';
  applyScenario(state, options.scenario);
  const input = options.input || neutralInput();
  const report = createReport(map, frames, botCount, options);
  for (let i = 0; i < frames; i++) {
    stepState(state, input);
    observeFrame(report, state);
    if (i % sampleEvery === 0) sampleFrame(report, state);
    if (state.winner && options.stopOnWinner !== false) break;
  }
  finishReport(report, state);
  return report;
}

export function simulateMapSet(maps, options = {}) {
  return maps.map(map => simulateMatch(map, options));
}

export function assertHealthyReport(report) {
  const failures = [];
  const warnings = [];
  const edgeRatio = ratio(report.opportunities.EdgePressure || 0, total(report.opportunities));
  if (report.invalidAttackCommands > (report.options.invalidLimit ?? 5)) failures.push('invalid attacks');
  if (report.namelessJumps > 0) failures.push('nameless jumps');
  if (report.nanFighters > 0) failures.push('NaN fighter values');
  if (report.maxParticles > 260) failures.push('particle cap exceeded');
  if (!report.aiDriven) failures.push('AI did not drive every bot');
  if (edgeRatio > (report.options.edgeRatioLimit ?? 0.72)) failures.push('edge pressure dominance');
  if (report.longestNoPressureWindow > (report.options.noPressureLimit ?? 900)) failures.push('long no-pressure window');
  if (report.damagePerMinute < 15) warnings.push('low damage');
  if (report.attackCommandsPerMinute < 10) warnings.push('low attack commands');
  if (report.damageEnd <= 0 && report.framesRun >= 3000) warnings.push('zero damage');
  return { ok: failures.length === 0, failures, warnings, edgeRatio };
}

function createReport(map, frames, botCount, options) {
  return {
    map: map.id,
    options,
    requestedFrames: frames,
    botCount,
    framesRun: 0,
    winner: null,
    attackCommands: 0,
    attackCommandsPerMinute: 0,
    activeAttackFrames: 0,
    rapidAttackCommands: 0,
    rapidAttackFrames: 0,
    charges: 0,
    jumps: 0,
    namelessJumps: 0,
    invalidAttackCommands: 0,
    antiPeaceFrames: 0,
    antiPeaceActivations: 0,
    comboMomentumFrames: 0,
    comboMomentumActivations: 0,
    killModeFrames: 0,
    forceEngageFrames: 0,
    recoveries: 0,
    escapes: 0,
    hiddenRespawns: 0,
    maxParticles: 0,
    nanFighters: 0,
    aiDriven: true,
    damageEnd: 0,
    damagePerMinute: 0,
    koCount: 0,
    loopDetectedFrames: 0,
    opportunityFatigueTriggers: 0,
    longestNoPressureWindow: 0,
    currentNoPressureWindow: 0,
    longestSameOpportunityWindow: 0,
    sameOpportunityWindow: {},
    frameHadPressure: false,
    states: {},
    opportunities: {},
    intents: {},
    commitments: {},
    attackReasons: {},
    jumpReasons: {},
    samples: []
  };
}

function observeFrame(report, state) {
  report.framesRun = state.frame;
  report.maxParticles = Math.max(report.maxParticles, state.particles.length);
  report.frameHadPressure = false;
  for (const f of state.fighters) {
    if (Number.isNaN(f.x) || Number.isNaN(f.y)) report.nanFighters++;
    if (f.hidden && !f.dead) report.hiddenRespawns++;
    if (f.dead) report.koCount++;
    if (f.human || f.dead || f.hidden) continue;
    observeBot(report, f);
  }
  updateNoPressureWindow(report);
}

function observeBot(report, f) {
  const mind = f.aiMind;
  if (!mind?.state) report.aiDriven = false;
  const opportunity = mind?.opportunity?.name || 'none';
  const intent = mind?.opportunity?.intent || 'none';
  count(report.states, mind?.state || 'none');
  count(report.opportunities, opportunity);
  count(report.intents, intent);
  count(report.commitments, mind?.commitment?.name || 'none');
  count(report.attackReasons, mind?.attackCheck?.reason || 'none');
  count(report.jumpReasons, mind?.jumpReason || 'none');
  updateSameOpportunity(report, f.id, opportunity);
  observeMindMetrics(report, mind);
  if (f.input?.jump) observeJump(report, mind);
  if (issuedAttackCommand(f)) observeAttackCommand(report, mind);
  if (f.attack) { report.activeAttackFrames++; report.frameHadPressure = true; }
  if (f.input?.rapidPunch) report.rapidAttackCommands++;
  if (f.rapidAttack) { report.rapidAttackFrames++; report.frameHadPressure = true; }
  if (f.input?.chargePunch || f.input?.chargeKick) report.charges++;
  if (mind?.state?.startsWith('Recover')) report.recoveries++;
  if (mind?.state?.startsWith('Escape')) report.escapes++;
}

function observeMindMetrics(report, mind) {
  if (mind?.positionLoop?.loopDetected) report.loopDetectedFrames++;
  if (mind?.opportunity?.fatigue?.stale) report.opportunityFatigueTriggers++;
  if (mind?.antiPeace?.active) report.antiPeaceFrames++;
  if (mind?.antiPeace?.activations) report.antiPeaceActivations = Math.max(report.antiPeaceActivations, mind.antiPeace.activations);
  if (mind?.comboMomentum?.active) report.comboMomentumFrames++;
  if (mind?.comboMomentum?.activations) report.comboMomentumActivations = Math.max(report.comboMomentumActivations, mind.comboMomentum.activations);
  if (mind?.combatHeat?.killMode) report.killModeFrames++;
  if (mind?.combatHeat?.forceEngage) report.forceEngageFrames++;
}

function observeJump(report, mind) {
  report.jumps++;
  if (mind?.jumpReason === 'None' || mind?.jumpReason === 'noReason') report.namelessJumps++;
}

function observeAttackCommand(report, mind) {
  report.attackCommands++;
  report.frameHadPressure = true;
  if (mind?.attackCheck?.valid === false) report.invalidAttackCommands++;
}

function updateNoPressureWindow(report) {
  if (report.frameHadPressure) report.currentNoPressureWindow = 0;
  else report.currentNoPressureWindow++;
  report.longestNoPressureWindow = Math.max(report.longestNoPressureWindow, report.currentNoPressureWindow);
}

function updateSameOpportunity(report, id, opportunity) {
  const slot = report.sameOpportunityWindow[id] ||= { name: '', frames: 0 };
  if (slot.name === opportunity) slot.frames++;
  else { slot.name = opportunity; slot.frames = 1; }
  report.longestSameOpportunityWindow = Math.max(report.longestSameOpportunityWindow, slot.frames);
}

function sampleFrame(report, state) {
  report.samples.push({ frame: state.frame, fighters: state.fighters.map(sampleFighter) });
}

function sampleFighter(f) {
  return { id: f.id, human: f.human, dead: f.dead, hidden: !!f.hidden, x: Math.round(f.x), y: Math.round(f.y), vx: round(f.vx), vy: round(f.vy), damage: Math.round(f.damage), stocks: f.stocks, state: f.aiMind?.state || null, opportunity: f.aiMind?.opportunity?.name || null, intent: f.aiMind?.opportunity?.intent || null, heat: Math.round(f.aiMind?.combatHeat?.heat || 0), commitment: f.aiMind?.commitment?.name || null, loop: !!f.aiMind?.positionLoop?.loopDetected };
}

function finishReport(report, state) {
  report.winner = state.winner || null;
  report.alive = state.fighters.filter(f => !f.dead).length;
  report.damageEnd = Math.round(state.fighters.reduce((sum, f) => sum + (f.damage || 0), 0));
  report.damagePerMinute = Math.round(report.damageEnd / Math.max(1, report.framesRun / 3600));
  report.attackCommandsPerMinute = Math.round(report.attackCommands / Math.max(1, report.framesRun / 3600));
  report.finalStocks = state.fighters.map(f => ({ id: f.id, human: f.human, stocks: f.stocks, damage: Math.round(f.damage), dead: f.dead }));
  report.health = assertHealthyReport(report);
}

function applyScenario(state, scenario) {
  if (!scenario) return;
  if (scenario === 'airborneHuman') return airborneHuman(state);
  if (scenario === 'edgeHuman') return edgeHuman(state);
  if (scenario === 'chargingHuman') return chargingHuman(state);
  if (typeof scenario === 'function') scenario(state);
}

function airborneHuman(state) {
  const hero = state.fighters.find(f => f.human);
  const bot = state.fighters.find(f => !f.human);
  if (!hero || !bot) return;
  hero.x = bot.x + 420;
  hero.y = bot.y - 260;
  hero.vx = -5;
  hero.vy = 7;
  hero.grounded = false;
}

function edgeHuman(state) {
  const hero = state.fighters.find(f => f.human);
  const p = state.map.platforms?.[0];
  if (!hero || !p) return;
  hero.x = p.x + p.w - 95;
  hero.y = p.y;
  hero.vx = 0;
  hero.grounded = true;
  hero.damage = 110;
}

function chargingHuman(state) {
  const hero = state.fighters.find(f => f.human);
  const bot = state.fighters.find(f => !f.human);
  if (!hero || !bot) return;
  hero.x = bot.x - 120;
  hero.y = bot.y;
  hero.face = 1;
  hero.charge ||= {};
  hero.charge.punch = 35;
  hero.chargeGlow = 0.7;
}

function issuedAttackCommand(f) {
  return !!(f.input?.punch || f.input?.kick || f.input?.grab || f.input?.rapidPunch);
}

function neutralInput() {
  return { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
}

function count(bucket, key) { bucket[key] = (bucket[key] || 0) + 1; }
function ratio(value, totalValue) { return totalValue ? value / totalValue : 0; }
function total(bucket) { return Object.values(bucket).reduce((sum, value) => sum + value, 0); }
function round(value) { return Math.round((value || 0) * 10) / 10; }
