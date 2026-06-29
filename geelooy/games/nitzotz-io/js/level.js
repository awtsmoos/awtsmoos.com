// B'H
import { createAwtsmoosEngine } from './engine/engine.js';
import { objectBudget } from './save.js';
export const WORLDS=[['Assiyah',42,1],['Yetzirah',188,1.22],['Beriah',265,1.48],['Atzilus',310,1.8]];
export function createLevel(save,worldIndex=0){const awts=createAwtsmoosEngine(),w=WORLDS[worldIndex%WORLDS.length],budget=objectBudget(save.perf),streamer=awts.streamer(worldIndex,budget,2),objects=streamer.update(0,0);return{name:w[0],worldIndex,target:Math.round(5600*w[2]),time:125,bounds:6000,objects,streamer,neighborhoods:[...new Set(objects.map(o=>o.hood))],hue:w[1],engine:'AwtsmoosEngine-0.2-streaming'}}
export function updateLevelStream(level,x,y){level.objects=level.streamer.update(x,y);level.neighborhoods=[...new Set(level.objects.map(o=>o.hood))];return level.objects}
