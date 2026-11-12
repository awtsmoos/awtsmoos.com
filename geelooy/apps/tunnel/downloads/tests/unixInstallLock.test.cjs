// B"H
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const lockFile=path.resolve(__dirname,'../unix-install-lock.sh');
test('stale installers are killed as a whole tree, and the lock wait is wall-clock',()=>{
 const code=fs.readFileSync(lockFile,'utf8');
 assert.match(code,/kill_installer_tree/);
 assert.match(code,/pgid.*=.*pid/);
 assert.match(code,/SECONDS \+ timeout_seconds/);
 assert.match(code,/while \[ "\$SECONDS" -lt "\$deadline" \]/);
 assert.doesNotMatch(code,/sample=\$\(\( sample \+ 1 \)\)/);
});
test('clear_stale_install_lock removes a lock whose owner is dead',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'awt-lock-'));
 try {
  const root=path.join(tmp,'.awtsmoos-tunnel');
  const lockDir=`${root}.install-lock`;
  fs.mkdirSync(lockDir,{recursive:true});
  fs.writeFileSync(path.join(lockDir,'owner.json'),JSON.stringify({
   schemaVersion:1,token:'dead-token',pid:999999,root,
   signature:'dead-process-signature',createdAt:new Date().toISOString()
  }));
  const driver=[
   'install_event(){ :; }',
   'prg_info(){ :; }',
   'prg_warn(){ :; }',
   `ROOT=${JSON.stringify(root)}`,
   `AWTSMOOS_INSTALL_RUNTIME=${JSON.stringify(path.resolve(__dirname,'..'))}`,
   `. ${JSON.stringify(path.resolve(__dirname,'../unix-install-errors.sh'))}`,
   `. ${JSON.stringify(lockFile)}`,
   'clear_stale_install_lock',
  ].join('\n');
  const run=spawnSync('/bin/bash',['-c',driver],{encoding:'utf8',timeout:20000});
  assert.equal(run.status,0,run.stderr);
  assert.equal(fs.existsSync(lockDir),false,'dead-owner lock is removed');
 } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
test('re-running clears a live lock owner as a tree without hunting by name',()=>{
 const code=fs.readFileSync(lockFile,'utf8');
 assert.match(code,/kill_lock_owner_tree/);
 assert.match(code,/could not be stopped; clearing its lock anyway/);
});
test('clear_stale_install_lock kills a live owner and takes the lock',async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'awt-lock-live-'));
 const {spawn,execFileSync}=require('node:child_process');
 let victim=null;
 try {
  const root=path.join(tmp,'.awtsmoos-tunnel');
  const lockDir=`${root}.install-lock`;
  fs.mkdirSync(lockDir,{recursive:true});
  victim=spawn('sleep',['60'],{detached:true,stdio:'ignore'});
  victim.unref();
  const signature=execFileSync('ps',['-p',String(victim.pid),'-o','lstart=','-o','command='],{encoding:'utf8'}).trim().slice(0,2000);
  assert.ok(signature.length>0,'victim signature readable');
  fs.writeFileSync(path.join(lockDir,'owner.json'),JSON.stringify({
   schemaVersion:1,token:'live-token',pid:victim.pid,root,
   signature,createdAt:new Date().toISOString()
  }));
  const exited=new Promise((resolve)=>{victim.once('exit',()=>resolve(true));});
  const driver=[
   'install_event(){ :; }',
   'prg_info(){ :; }',
   'prg_warn(){ :; }',
   `ROOT=${JSON.stringify(root)}`,
   `AWTSMOOS_INSTALL_RUNTIME=${JSON.stringify(path.resolve(__dirname,'..'))}`,
   `. ${JSON.stringify(path.resolve(__dirname,'../unix-install-errors.sh'))}`,
   `. ${JSON.stringify(lockFile)}`,
   'clear_stale_install_lock',
  ].join('\n');
  const run=spawnSync('/bin/bash',['-c',driver],{encoding:'utf8',timeout:20000});
  assert.equal(run.status,0,run.stderr);
  assert.equal(fs.existsSync(lockDir),false,'live-owner lock is taken');
  const died=await Promise.race([exited,new Promise((r)=>setTimeout(()=>r(false),3000))]);
  assert.equal(died,true,'lock owner process was stopped');
 } finally {
  if (victim&&victim.exitCode===null){try{process.kill(victim.pid,'SIGKILL')}catch{}}
  fs.rmSync(tmp,{recursive:true,force:true});
 }
});
