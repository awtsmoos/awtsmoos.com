// B"H
import assert from 'node:assert/strict';
import { DialogueBeatCompiler } from '../../src/director/dialogue/DialogueBeatCompiler.js';
const events=DialogueBeatCompiler.compile([{start:0,end:1000,speaker:'guide',listener:'kid',text:'Look',autoShot:true,shotIntent:'dialogueWithObject',targets:['guide','kid','apple'],prop:{id:'apple'}}]);
const cam=events.find(e=>e.type==='camera');
assert.ok(cam.autoShot);
assert.ok(cam.targets.includes('apple'));
console.log('B"H dialogue auto shot smoke passed');
