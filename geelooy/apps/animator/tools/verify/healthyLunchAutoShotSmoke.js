// B"H
import assert from 'node:assert/strict';
import { CameraProcessor } from '../../src/core/app/director/logic/CameraProcessor.js';
const data={characters:{kid:{id:'kid',position:{x:-40,y:210,scale:1}},guide:{id:'guide',position:{x:40,y:210,scale:1}}},props:[{id:'apple',x:0,y:110,size:18}],camera:null};
const state={get:k=>data[k],set:(k,v)=>data[k]=v};
CameraProcessor.process(state,{type:'camera',autoShot:true,speaker:'guide',listener:'kid',targets:['guide','kid'],shotIntent:'dialogue'},0);
assert.ok(data.camera.zoom >= .5);
assert.equal(data.camera.shot,'twoShot');
console.log('B"H healthy lunch auto shot smoke passed');
