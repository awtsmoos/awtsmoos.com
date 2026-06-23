// B"H
import { createWorldGenerationQueue } from '../../systems/streaming/WorldGenerationQueue.js';
import { generationBudgetFor } from '../../systems/streaming/GenerationBudget.js';
let clock=0, order=[]; const q=createWorldGenerationQueue({budgetMs:2,now:()=>clock++});
q.push({name:'far',priority:90,run:()=>order.push('far')}); q.push({name:'player',priority:1,run:()=>order.push('player')});
q.tick(); if(order[0]!=='player') throw new Error('Generation queue did not prioritize player-critical work');
if(generationBudgetFor({fps:60,ring:'near'})<=generationBudgetFor({fps:60,ring:'far'})) throw new Error('Near generation budget must exceed far budget');
console.log('B"H lightningWorldGenerationAudit passed');
