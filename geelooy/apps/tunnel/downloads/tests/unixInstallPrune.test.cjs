// B"H
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const retention=path.resolve(__dirname,'../unix-log-retention.sh');
test('prune_displaced_runtimes never deletes in the foreground',()=>{
 const code=fs.readFileSync(retention,'utf8');
 assert.match(code,/set_aside_disposable_tree/);
 assert.doesNotMatch(code,/rm -rf "\$directory"/);
});
test('prune sets the oldest displaced runtimes aside and keeps the newest',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'awt-prune-'));
 try {
  const root=path.join(tmp,'.awtsmoos-tunnel');
  const recovery=path.join(tmp,'.awtsmoos-tunnel-recovery');
  fs.mkdirSync(root,{recursive:true});
  fs.mkdirSync(recovery,{recursive:true});
  // Fresh sweep guard so the background sweep cannot clear the trash mid-test.
  fs.writeFileSync(path.join(recovery,'.prune-trash.sweeping'),'');
  const names=[];
  for (let i=0;i<6;i++){
   const d=path.join(tmp,`.awtsmoos-tunnel.failed-2026010${i}`);
   fs.mkdirSync(d);
   fs.writeFileSync(path.join(d,'file.txt'),'x'.repeat(1000));
   fs.utimesSync(d,new Date(Date.UTC(2026,0,i+1)),new Date(Date.UTC(2026,0,i+1)));
   names.push(d);
  }
  const driver=[
   'prg_warn(){ :; }',
   `ROOT=${JSON.stringify(root)}`,
   `RECOVERY_ROOT=${JSON.stringify(recovery)}`,
   `. ${JSON.stringify(retention)}`,
   'prune_displaced_runtimes',
  ].join('\n');
  const run=spawnSync('/bin/bash',['-c',driver],{encoding:'utf8',timeout:10000});
  assert.equal(run.status,0,run.stderr);
  for (const d of names.slice(2)) assert.ok(fs.existsSync(d),`newest kept: ${d}`);
  for (const d of names.slice(0,2)) assert.equal(fs.existsSync(d),false,`oldest set aside: ${d}`);
  const trash=path.join(recovery,'.prune-trash');
  assert.ok(fs.existsSync(trash),'trash exists');
  assert.equal(fs.readdirSync(trash).length,2,'two oldest moved to trash');
 } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
