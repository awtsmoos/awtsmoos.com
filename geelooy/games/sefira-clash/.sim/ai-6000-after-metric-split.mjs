import { writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const map=MAPS.find(m=>m.id==='beit-midrash-bouncer')||MAPS[0];
const r=simulateMatch(map,{frames:6000,botCount:5,sampleEvery:6000,stopOnWinner:false});
const row={map:r.map,ok:r.health.ok,failures:r.health.failures,warnings:r.health.warnings,aiDriven:r.aiDriven,damageEnd:r.damageEnd,peakDamage:r.peakDamage,damageFrames:r.damageFrames,longestNoPressureWindow:r.longestNoPressureWindow,longestSameOpportunityWindow:r.longestSameOpportunityWindow,attackCommands:r.attackCommands,activeAttackFrames:r.activeAttackFrames,damagePerMinute:r.damagePerMinute,koCount:r.koCount,maxParticles:r.maxParticles,framesRun:r.framesRun,simMs:r.simMs,states:r.states,opportunities:r.opportunities,finalStocks:r.finalStocks};
writeFileSync('.sim/ai-6000-after-metric-split.json', JSON.stringify(row,null,2));
console.log(JSON.stringify(row,null,2));
