import { readFileSync, appendFileSync, writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
const path = '.sim/sefira_18000_all_maps_final_after_idle_fix.jsonl';
const rows = readFileSync(path, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
const mapRows = rows.filter(r => r.map);
const existingSummary = rows.find(r => r.done);
const summary = existingSummary || {
  done: true,
  total: mapRows.length,
  expectedMaps: MAPS.length,
  allExpectedMapsPresent: mapRows.length === MAPS.length,
  ok: mapRows.length === MAPS.length && mapRows.every(r => r.ok && r.failures.length === 0 && r.warnings.length === 0),
  failures: mapRows.flatMap(r => r.failures.map(f => `${r.map}: ${f}`)),
  warnings: mapRows.flatMap(r => r.warnings.map(w => `${r.map}: ${w}`)),
  totalFrames: mapRows.reduce((sum, r) => sum + r.framesRun, 0),
  totalAttackCommands: mapRows.reduce((sum, r) => sum + r.attackCommands, 0),
  totalActiveAttackFrames: mapRows.reduce((sum, r) => sum + r.activeAttackFrames, 0),
  totalKOs: mapRows.reduce((sum, r) => sum + r.koCount, 0),
  maxNoPressureWindow: Math.max(...mapRows.map(r => r.longestNoPressureWindow)),
  maxIdleNearEnemyWindow: Math.max(...mapRows.map(r => r.longestIdleNearEnemyWindow || 0)),
  maxParticles: Math.max(...mapRows.map(r => r.maxParticles)),
  totalMs: mapRows.reduce((sum, r) => sum + r.ms, 0),
  maps: mapRows.map(r => ({ map: r.map, ok: r.ok, warnings: r.warnings, failures: r.failures, framesRun: r.framesRun, koCount: r.koCount, peakDamage: r.peakDamage, longestNoPressureWindow: r.longestNoPressureWindow, longestIdleNearEnemyWindow: r.longestIdleNearEnemyWindow, maxParticles: r.maxParticles }))
};
if (!existingSummary) appendFileSync(path, JSON.stringify(summary) + '\n');
writeFileSync('.sim/sefira_18000_all_maps_final_after_idle_fix_summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
