#!/usr/bin/env node
import { MAPS } from '../js/data/maps.js';
import { simulateMapSet, simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';

/**
 * B"H
 * CLI for dreaming complete Sefira Clash matches.
 *
 * Chapter 88: the command scroll now exposes aggression: heat-born anti-peace,
 * combo momentum, kill mode, force engage, attacks per minute, and warnings for
 * quiet arenas that still refuse the sword.
 */
const args = parseArgs(process.argv.slice(2));
const frames = Number(args.frames || 1800);
const botCount = Number(args.bots || 5);
const scenario = args.scenario || null;
const sampleEvery = Number(args.sampleEvery || 60);
const options = { frames, botCount, scenario, sampleEvery, stopOnWinner: args.stopOnWinner !== 'false' };
const maps = args.map ? MAPS.filter(map => map.id === args.map) : MAPS.slice(0, Number(args.count || 8));
if (!maps.length) throw new Error(`No map matched ${args.map}`);
const reports = args.map ? [simulateMatch(maps[0], options)] : simulateMapSet(maps, options);
const summary = { ok: reports.every(report => report.health.ok), frames, botCount, scenario, maps: reports.map(summarizeReport), reports: args.full ? reports : undefined };
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exitCode = 1;

function summarizeReport(report) {
  return {
    map: report.map,
    ok: report.health.ok,
    failures: report.health.failures,
    warnings: report.health.warnings,
    edgeRatio: Math.round(report.health.edgeRatio * 1000) / 1000,
    framesRun: report.framesRun,
    attackCommands: report.attackCommands,
    attackCommandsPerMinute: report.attackCommandsPerMinute,
    activeAttackFrames: report.activeAttackFrames,
    invalidAttackCommands: report.invalidAttackCommands,
    namelessJumps: report.namelessJumps,
    antiPeaceFrames: report.antiPeaceFrames,
    antiPeaceActivations: report.antiPeaceActivations,
    comboMomentumFrames: report.comboMomentumFrames,
    comboMomentumActivations: report.comboMomentumActivations,
    killModeFrames: report.killModeFrames,
    forceEngageFrames: report.forceEngageFrames,
    loopDetectedFrames: report.loopDetectedFrames,
    opportunityFatigueTriggers: report.opportunityFatigueTriggers,
    longestNoPressureWindow: report.longestNoPressureWindow,
    longestSameOpportunityWindow: report.longestSameOpportunityWindow,
    damagePerMinute: report.damagePerMinute,
    koCount: report.koCount,
    maxParticles: report.maxParticles,
    opportunities: report.opportunities,
    intents: report.intents,
    winner: report.winner
  };
}

function parseArgs(values) {
  const out = {};
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    const next = values[i + 1];
    if (!next || next.startsWith('--')) out[key] = true;
    else out[key] = values[++i];
  }
  return out;
}
