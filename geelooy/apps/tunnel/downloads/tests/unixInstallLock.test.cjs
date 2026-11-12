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
