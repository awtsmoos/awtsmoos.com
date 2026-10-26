// B"H
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');
const custody=path.resolve(__dirname,'../unix-install-custody.cjs');
test('installer provides discoverable status and cancellation without exposing credentials',()=>{
 const code=fs.readFileSync(custody,'utf8');
 assert.match(code,/Runner PID/);
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


test('verified installation leaves a durable status command after temporary runtime cleanup',()=>{
 const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'awt-custody-live-'));
 const runtime=path.join(root,'temporary-runtime'), recovery=path.join(root,'recovery');
 fs.mkdirSync(runtime,{recursive:true});
 const fake=path.join(runtime,'fake-core.sh');
 fs.writeFileSync(fake,'#!/bin/bash\nprintf "[100%%] complete\\n"\nexit 0\n');
 try {
  const run=spawnSync(process.execPath,[custody,'delegate',fake,runtime,recovery,root],{encoding:'utf8',timeout:9000});
  assert.equal(run.status,0,run.stderr);
  assert.match(run.stderr,/AWTSMOOS \/ LIVE INSTALL CONTROL/);
  const command=path.join(recovery,'bin','awtsmoos-installer-control.cjs');
  assert.ok(fs.existsSync(command),'persistent control file survives runtime deletion');
  assert.equal(fs.existsSync(runtime),false,'temporary runtime removed on success');
  const status=spawnSync(process.execPath,[command,'status'],{encoding:'utf8',timeout:3000});
  assert.equal(status.status,0,status.stderr);
  assert.match(status.stdout,/State:\s+completed/);
  assert.match(status.stdout,/Running:\s+no/);
  const cancel=spawnSync(process.execPath,[command,'cancel'],{encoding:'utf8',timeout:3000});
  assert.equal(cancel.status,0,cancel.stderr);
  assert.match(cancel.stdout,/No matching active installer/);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});


test('cancel interrupts a slow installer subprocess without waiting for its sleep', async()=>{
 const os=require('node:os');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awt-custody-cancel-'));
 const runtime=path.join(root,'temporary-runtime'), recovery=path.join(root,'recovery');
 fs.mkdirSync(runtime,{recursive:true});
 const fake=path.join(runtime,'sleeping-core.sh');
 fs.writeFileSync(fake,'#!/bin/bash\n/ bin /true\n'.replace('/ bin /true','sleep 15'));
 let child;
 try {
  child=spawn(process.execPath,[custody,'delegate',fake,runtime,recovery,root],{stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});
  const control=path.join(recovery,'bin','awtsmoos-installer-control.cjs');
  const receipt=path.join(recovery,'transactions','installer-custody-current.json');
  let ready=false;
  for(let i=0;i<50;i++){
   await new Promise(r=>setTimeout(r,60));
   if(fs.existsSync(control)&&fs.existsSync(receipt)){
    const r=JSON.parse(fs.readFileSync(receipt,'utf8'));
    if(r.corePid&&r.runtimeRoot===runtime){ready=true;break;}
   }
  }
  assert.ok(ready,'fixture installer starts');
  const state=spawnSync(process.execPath,[control,'status'],{encoding:'utf8',timeout:3000});
  assert.match(state.stdout,/Running:\s+yes/);
  assert.match(state.stdout,/Installer processes \(PID \/ parent \/ executable\)/);
  const cancel=spawnSync(process.execPath,[control,'cancel'],{encoding:'utf8',timeout:3000});
  assert.equal(cancel.status,0,cancel.stderr);
  assert.match(cancel.stdout,/Cancellation requested/);
  const code=await Promise.race([
   new Promise((resolve,reject)=>{child.once('close',resolve);child.once('error',reject)}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('cancel took longer than 4s')),4000))
  ]);
  assert.notEqual(code,0,'cancellation must not report success');
  const ended=JSON.parse(fs.readFileSync(receipt,'utf8'));
  assert.equal(ended.terminal,true);
  assert.equal(ended.state,'failed');
 }finally{
  if(child&&child.exitCode===null){try{child.kill('SIGTERM')}catch{}}
  fs.rmSync(root,{recursive:true,force:true});
 }
});
