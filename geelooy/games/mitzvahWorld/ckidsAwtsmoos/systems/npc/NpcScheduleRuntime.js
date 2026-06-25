// B"H
/**
 * NpcScheduleRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { dailyRole } from './VillageDailyLifeRuntime.js';
export function createNpcScheduleRuntime(npcs=[]){ let cursor=0; return { tick(hour=new Date().getHours(),budget={}){ const cap=budget.maxTasksPerTick||3; const out=[]; for(let i=0;i<Math.min(cap,npcs.length);i++){const npc=npcs[cursor++%npcs.length]; out.push({id:npc.id||npc.npcId,role:dailyRole(hour)});} return out;}, schedule(npcId,hour){return {npcId,role:dailyRole(hour),updatedAt:Date.now()};} }; }
export default createNpcScheduleRuntime;
