// B"H
import assert from 'node:assert/strict';
import { ShotContinuityEngine } from '../../src/camera/continuity/ShotContinuityEngine.js';
const state={h:[{x:0,y:120,zoom:1,angle:{yaw:45}}],get:k=>k==='_shotHistory'?state.h:null,set:(k,v)=>state.h=v};
const plan=ShotContinuityEngine.apply({x:200,y:160,zoom:1.8,angle:{yaw:260}},state);
assert.ok(plan.continuity.cutSeverity > 0);
assert.notEqual(plan.angle.yaw,260);
console.log('B"H shot continuity smoke passed');
