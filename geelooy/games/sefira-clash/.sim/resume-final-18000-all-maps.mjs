import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const out = '.sim/sefira_18000_all_maps_final_after_idle_fix.jsonl';
const existing = readFileSync(out, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse).filter(r => r.map);
const seen = new Set(existing.map(r => r.map));
writeFileSync(out, existing.map(r => JSON.stringify(r)).join('\n') + '\n');
const rows = [...existing];
const remaining = MAPS.filter(m => !seen.has(m.id));
console.log(JSON.stringify({ resume: true, existing: existing.length, expected: MAPS.length, remaining: remaining.map(m => m.id) }));
for (const map of remaining) {
  const started = Date.now();
  const r = simulateMatch(map, { frames: 18000, botCount: 5, sampleEvery: 18000, stopOnWinner: false });
  const row = {
    map: r.map, ok: r.health.ok, failures: r.health.failures, warnings: r.health.warnings,
    edgeRatio: +r.health.edgeRatio.toFixed(3), framesRun: r.framesRun,
    attackCommands: r.attackCommands, activeAttackFrames: r.activeAttackFrames,
    invalidAttackCommands: r.invalidAttackCommands, namelessJumps: r.namelessJumps,
    loopDetectedFrames: r.loopDetectedFrames, opportunityFatigueTriggers: r.opportunityFatigueTriggers,
    longestIdleNearEnemyWindow: r.longestIdleNearEnemyWindow,
    longestNoPressureWindow: r.longestNoPressureWindow,
    longestSameOpportunityWindow: r.longestSameOpportunityWindow,
    damageEnd: r.damageEnd, peakDamage: r.peakDamage, damageFrames: r.damageFrames,
    damagePerMinute: r.damagePerMinute, koCount: r.koCount, maxParticles: r.maxParticles,
    winner: r.winner, alive: r.alive, opportunities: r.opportunities, states: r.states,
    finalStocks: r.finalStocks, ms: Date.now() - started
  };
  rows.push(row);
  appendFileSync(out, JSON.stringify(row) + '\n');
  console.log(JSON.stringify({ map: row.map, ok: row.ok, failures: row.failures, warnings: row.warnings, framesRun: row.framesRun, longestIdleNearEnemyWindow: row.longestIdleNearEnemyWindow, koCount: row.koCount, peakDamage: row.peakDamage, ms: row.ms }));
}
const summary = {
  done: true, total: rows.length, expectedMaps: MAPS.length,
  allExpectedMapsPresent: rows.length === MAPS.length,
  ok: rows.length === MAPS.length && rows.every(r => r.ok && r.failures.length === 0 && r.warnings.length === 0),
  failures: rows.flatMap(r => r.failures.map(f => `${r.map}: ${f}`)),
  warnings: rows.flatMap(r => r.warnings.map(w => `${r.map}: ${w}`)),
  totalFrames: rows.reduce((sum, r) => sum + r.framesRun, 0),
  totalAttackCommands: rows.reduce((sum, r) => sum + r.attackCommands, 0),
  totalActiveAttackFrames: rows.reduce((sum, r) => sum + r.activeAttackFrames, 0),
  totalKOs: rows.reduce((sum, r) => sum + r.koCount, 0),
  maxNoPressureWindow: Math.max(...rows.map(r => r.longestNoPressureWindow)),
  maxIdleNearEnemyWindow: Math.max(...rows.map(r => r.longestIdleNearEnemyWindow || 0)),
  maxParticles: Math.max(...rows.map(r => r.maxParticles)),
  totalMs: rows.reduce((sum, r) => sum + r.ms, 0),
  maps: rows.map(r => ({ map: r.map, ok: r.ok, warnings: r.warnings, failures: r.failures, framesRun: r.framesRun, koCount: r.koCount, peakDamage: r.peakDamage, longestNoPressureWindow: r.longestNoPressureWindow, longestIdleNearEnemyWindow: r.longestIdleNearEnemyWindow, maxParticles: r.maxParticles }))
};
appendFileSync(out, JSON.stringify(summary) + '\n');
writeFileSync('.sim/sefira_18000_all_maps_final_after_idle_fix_summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
