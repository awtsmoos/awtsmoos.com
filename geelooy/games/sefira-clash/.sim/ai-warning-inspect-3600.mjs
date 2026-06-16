import { writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const map=MAPS.find(m=>m.id==='beit-midrash-bouncer') || MAPS[0];
const r=simulateMatch(map,{frames:3600,botCount:5,sampleEvery:3600,stopOnWinner:false});
const row={frames:3600,ok:r.health.ok,warnings:r.health.warnings,failures:r.health.failures,damageEnd:r.damageEnd,damagePerMinute:r.damagePerMinute,koCount:r.koCount,alive:r.alive,combatEnded:r.combatEnded,combatEndedAt:r.combatEndedAt,attackCommands:r.attackCommands,activeAttackFrames:r.activeAttackFrames,maxParticles:r.maxParticles,longestNoPressureWindow:r.longestNoPressureWindow,simMs:r.simMs};
writeFileSync('.sim/ai-warning-inspect-3600.json', JSON.stringify(row,null,2));
console.log(JSON.stringify(row,null,2));
