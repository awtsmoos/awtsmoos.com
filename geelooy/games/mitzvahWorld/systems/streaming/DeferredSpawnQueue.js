// B"H
import { createWorldGenerationQueue } from './WorldGenerationQueue.js';
export function createDeferredSpawnQueue(options={}){const queue=createWorldGenerationQueue(options);return{defer(name,priority,spawn){return queue.push({name,priority,run:spawn})},tick:()=>queue.tick(),report:()=>queue.report()}}
export default createDeferredSpawnQueue;
