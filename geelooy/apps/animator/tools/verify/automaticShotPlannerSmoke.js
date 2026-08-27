// B"H
import assert from 'node:assert/strict';
import { AutomaticShotPlanner } from '../../src/camera/planning/AutomaticShotPlanner.js';
const store={characters:{kid:{id:'kid',position:{x:-40,y:210,scale:1}},guide:{id:'guide',position:{x:40,y:210,scale:1}}},props:[{id:'apple',type:'apple',x:0,y:110,size:18}]};
const state={get:k=>store[k],set:(k,v)=>store[k]=v};
assert.equal(AutomaticShotPlanner.plan({autoShot:true,speaker:'guide',listener:'kid',targets:['guide','kid']},state).shotType,'twoShot');
assert.ok(/insert/i.test(AutomaticShotPlanner.plan({autoShot:true,shotIntent:'foodAction',targets:['apple'],prop:'apple'},state).shotType));
assert.ok(['closeUp','mediumCloseUp','reactionShot','dramaticPush'].includes(AutomaticShotPlanner.plan({autoShot:true,shotIntent:'reaction',targets:['kid'],emotion:'surprised'},state).shotType));
console.log('B"H automatic shot planner smoke passed');
