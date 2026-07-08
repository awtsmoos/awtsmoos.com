// B"H
import { createWorldGenerationQueue } from './WorldGenerationQueue.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
export function createDeferredSpawnQueue(options={}){const queue=createWorldGenerationQueue(options);return{defer(name,priority,spawn){return queue.push({name,priority,run:spawn})},tick:()=>queue.tick(),report:()=>queue.report()}}
export default createDeferredSpawnQueue;
