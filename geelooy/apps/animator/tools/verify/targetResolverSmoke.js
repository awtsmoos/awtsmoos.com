// B"H
import assert from 'node:assert/strict';
import { TargetResolver } from '../../src/camera/targets/TargetResolver.js';
const state={get:k=>k==='characters'?{kid:{id:'kid',position:{x:10,y:200,scale:1}},guide:{id:'guide',position:{x:100,y:200,scale:1}}}:k==='props'?[{id:'apple',type:'apple',x:40,y:100,size:18}]:null};
const targets=TargetResolver.resolve({speaker:'guide',listener:'kid',prop:'apple',targets:['guide','kid','apple']},state);
assert.equal(targets.length,3);
assert.equal(targets[0].id,'guide');
console.log('B"H target resolver smoke passed');
