#!/usr/bin/env node
import { MAPS } from '../js/data/maps.js';
import { simulateMapSet, simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';

/**
 * B"H
 * Reforge audit runner.
 *
 * Chapter 9: the Awtsmoos places the battle inside a clear glass furnace. Bots
 * fight unseen, numbers rise like sparks, and the command reports whether the
 * reforged combat is alive, fair, fast, and measurable.
 */
const args = parseArgs(process.argv.slice(2));
const options = {
  frames: Number(args.frames || 2400),
  botCount: Number(args.bots || 5),
  sampleEvery: Number(args.sampleEvery || 0),
  fast: true,
  stopOnWinner: args.stopOnWinner !== 'false'
};
const maps = args.map ? MAPS.filter(map => map.id === args.map) : MAPS.slice(0, Number(args.count || 4));
if (!maps.length) throw new Error(`No map matched ${args.map}`);
const reports = args.map ? [simulateMatch(maps[0], options)] : simulateMapSet(maps, options);
const summary = buildSummary(reports, options);
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exitCode = 1;

function buildSummary(reports, options) {
  const totals = reports.reduce((out, report) => {
    out.damage += report.damagePerMinute || 0;
    out.kos += report.koCount || 0;
    out.attacks += report.attackCommands || 0;
    out.invalid += report.invalidAttackCommands || 0;
    return out;
  }, { damage: 0, kos: 0, attacks: 0, invalid: 0 });
  return {
    ok: reports.every(report => report.health.ok),
    frames: options.frames,
    botCount: options.botCount,
    mapsRun: reports.length,
    averageDamagePerMinute: round(totals.damage / reports.length),
    totalKos: totals.kos,
    totalAttackCommands: totals.attacks,
    invalidAttackCommands: totals.invalid,
    maps: reports.map(report => ({
      map: report.map,
      ok: report.health.ok,
      failures: report.health.failures,
      warnings: report.health.warnings,
      fps: report.framesPerSecond,
      damagePerMinute: report.damagePerMinute,
      koCount: report.koCount,
      winner: report.winner
    }))
  };
}

function round(value) {
  return Math.round((value || 0) * 100) / 100;
}

function parseArgs(values) {
  const out = {};
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    const next = values[i + 1];
    out[key] = !next || next.startsWith('--') ? true : values[++i];
  }
  return out;
}
