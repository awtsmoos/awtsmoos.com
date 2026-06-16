import { appendFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const id = process.argv[2];
const out = process.argv[3] || '.sim/sefira_18000_all_maps_controlled_clean.jsonl';
const map = MAPS.find(m => m.id === id);
if (!map) throw new Error(`unknown map ${id}`);
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
appendFileSync(out, JSON.stringify(row) + '\n');
console.log(JSON.stringify(row, null, 2));
