import { writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const focusIds=['beit-midrash-bouncer','merkava-pinball-court','malchus-meadow'];
const rows=MAPS.filter(m=>focusIds.includes(m.id)).map(map=>summarize(simulateMatch(map,{frames:3000,botCount:5,sampleEvery:3000,stopOnWinner:false})));
writeFileSync('.sim/ai-focused-animation-continuation.json', JSON.stringify(rows,null,2));
console.log(JSON.stringify(rows,null,2));
function summarize(r){return{map:r.map,ok:r.health.ok,failures:r.health.failures,warnings:r.health.warnings,aiDriven:r.aiDriven,longestNoPressureWindow:r.longestNoPressureWindow,longestSameOpportunityWindow:r.longestSameOpportunityWindow,attackCommands:r.attackCommands,activeAttackFrames:r.activeAttackFrames,damagePerMinute:r.damagePerMinute,koCount:r.koCount,maxParticles:r.maxParticles,framesRun:r.framesRun,simMs:r.simMs,states:r.states,opportunities:r.opportunities};}
