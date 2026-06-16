import { writeFileSync, appendFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const out = '.sim/sefira_18000_all_maps_final_after_idle_fix.jsonl';
writeFileSync(out, '');
const rows = [];
for (const map of MAPS) {
  const started = Date.now();
  const r = simulateMatch(map, { frames: 18000, botCount: 5, sampleEvery: 18000, stopOnWinner: false });
  const row = {
    map: r.map,
    ok: r.health.ok,
    failures: r.health.failures,
    warnings: r.health.warnings,
    edgeRatio: +r.health.edgeRatio.toFixed(3),
    framesRun: r.framesRun,
    attackCommands: r.attackCommands,
    activeAttackFrames: r.activeAttackFrames,
    invalidAttackCommands: r.invalidAttackCommands,
    namelessJumps: r.namelessJumps,
    loopDetectedFrames: r.loopDetectedFrames,
    opportunityFatigueTriggers: r.opportunityFatigueTriggers,
    longestIdleNearEnemyWindow: r.longestIdleNearEnemyWindow,
    longestNoPressureWindow: r.longestNoPressureWindow,
    longestSameOpportunityWindow: r.longestSameOpportunityWindow,
    damageEnd: r.damageEnd,
    peakDamage: r.peakDamage,
    damageFrames: r.damageFrames,
    damagePerMinute: r.damagePerMinute,
    koCount: r.koCount,
    maxParticles: r.maxParticles,
    winner: r.winner,
    alive: r.alive,
    opportunities: r.opportunities,
    states: r.states,
    finalStocks: r.finalStocks,
    ms: Date.now() - started
  };
  rows.push(row);
  appendFileSync(out, JSON.stringify(row) + '\n');
  console.log(JSON.stringify({ map: row.map, ok: row.ok, failures: row.failures, warnings: row.warnings, framesRun: row.framesRun, longestIdleNearEnemyWindow: row.longestIdleNearEnemyWindow, koCount: row.koCount, peakDamage: row.peakDamage, ms: row.ms }));
}
const summary = {
  done: true,
  total: rows.length,
  ok: rows.every(r => r.ok && r.failures.length === 0 && r.warnings.length === 0),
  failures: rows.flatMap(r => r.failures.map(f => `${r.map}: ${f}`)),
  warnings: rows.flatMap(r => r.warnings.map(w => `${r.map}: ${w}`)),
  totalMs: rows.reduce((sum, r) => sum + r.ms, 0)
};
appendFileSync(out, JSON.stringify(summary) + '\n');
console.log(JSON.stringify(summary, null, 2));
