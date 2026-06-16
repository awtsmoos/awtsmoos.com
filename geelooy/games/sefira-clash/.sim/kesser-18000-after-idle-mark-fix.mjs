import { writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const map=MAPS.find(m=>m.id==='kesser-rift');
const r=simulateMatch(map,{frames:18000,botCount:5,sampleEvery:18000,stopOnWinner:false});
const row={map:r.map,ok:r.health.ok,failures:r.health.failures,warnings:r.health.warnings,framesRun:r.framesRun,longestIdleNearEnemyWindow:r.longestIdleNearEnemyWindow,longestNoPressureWindow:r.longestNoPressureWindow,attackCommands:r.attackCommands,activeAttackFrames:r.activeAttackFrames,peakDamage:r.peakDamage,damageFrames:r.damageFrames,koCount:r.koCount,maxParticles:r.maxParticles,states:r.states,opportunities:r.opportunities};
writeFileSync('.sim/kesser-18000-after-idle-mark-fix.json',JSON.stringify(row,null,2));
console.log(JSON.stringify(row,null,2));
