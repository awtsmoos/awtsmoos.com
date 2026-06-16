import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';
const map=MAPS.find(m=>m.id==='beit-midrash-bouncer') || MAPS[0];
for (const frames of [3600,4200,4800]) {
 const r=simulateMatch(map,{frames,botCount:5,sampleEvery:frames,stopOnWinner:false});
 console.log(JSON.stringify({frames,ok:r.health.ok,warnings:r.health.warnings,damageEnd:r.damageEnd,damagePerMinute:r.damagePerMinute,koCount:r.koCount,alive:r.alive,combatEnded:r.combatEnded,combatEndedAt:r.combatEndedAt,attackCommands:r.attackCommands,activeAttackFrames:r.activeAttackFrames,simMs:r.simMs}));
}
