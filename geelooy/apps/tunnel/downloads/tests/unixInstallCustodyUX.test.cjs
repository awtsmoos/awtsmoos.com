// B"H
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const custody=path.resolve(__dirname,'../unix-install-custody.cjs');
test('installer provides discoverable status and cancellation without exposing credentials',()=>{
 const code=fs.readFileSync(custody,'utf8');
 assert.match(code,/runner PID:/);
 assert.match(code,/core PID/);
 assert.match(code,/kill -TERM/);
 assert.match(code,/lastHeartbeat >= 5000/);
 assert.match(code,/core\.kill\("SIGTERM"\)/);
 assert.doesNotMatch(code,/process\.stdout\.write\(JSON\.stringify\(process\.env\)/);
});
test('status command handles an absent receipt without crashing',()=>{
 const tmp=fs.mkdtempSync('/tmp/awt-custody-');
 try {const p=spawnSync(process.execPath,[custody,'status','/tmp/none','/tmp/none',tmp],{encoding:'utf8',timeout:3000});assert.equal(p.status,0,p.stderr);assert.match(p.stdout,/No installation receipt/);}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
