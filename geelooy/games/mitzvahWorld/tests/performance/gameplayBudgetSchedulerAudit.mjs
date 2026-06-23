// B"H
import { createGameplayBudgetScheduler } from '../../systems/performance/GameplayBudgetScheduler.js';
let t=0, ran=0; const scheduler=createGameplayBudgetScheduler({now:()=>t,player:()=>({x:0,z:0})});
scheduler.add({name:'near-ai',position:()=>({x:1,z:1}),run:()=>ran++});
for(t=0;t<1000;t+=17) scheduler.tick(t);
if(ran<5||ran>12) throw new Error(`Unexpected near AI budget count ${ran}`);
console.log('B"H gameplayBudgetSchedulerAudit passed');
