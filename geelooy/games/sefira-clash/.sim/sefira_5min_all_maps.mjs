import { writeFileSync, appendFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const out='.sim/sefira_5min_all_maps.jsonl';
writeFileSync(out, '');
for (const map of MAPS) {
  const started=Date.now();
  const r = simulateMatch(map, {frames:18000, botCount:5, sampleEvery:18000, stopOnWinner:false});
  const row={map:r.map, ok:r.health.ok, failures:r.health.failures, edgeRatio:+r.health.edgeRatio.toFixed(3), framesRun:r.framesRun, attackCommands:r.attackCommands, activeAttackFrames:r.activeAttackFrames, invalidAttackCommands:r.invalidAttackCommands, namelessJumps:r.namelessJumps, loopDetectedFrames:r.loopDetectedFrames, opportunityFatigueTriggers:r.opportunityFatigueTriggers, longestNoPressureWindow:r.longestNoPressureWindow, longestSameOpportunityWindow:r.longestSameOpportunityWindow, damagePerMinute:r.damagePerMinute, koCount:r.koCount, maxParticles:r.maxParticles, winner:r.winner, opportunities:r.opportunities, ms:Date.now()-started};
  appendFileSync(out, JSON.stringify(row)+'\n');
}
appendFileSync(out, JSON.stringify({done:true,total:MAPS.length})+'\n');
