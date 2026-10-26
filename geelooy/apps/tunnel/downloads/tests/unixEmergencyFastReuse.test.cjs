// B"H
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const source=path.resolve(__dirname,'../unix-emergency-capture.sh');
const q=x=>"'"+String(x).replaceAll("'","'\\''")+"'";
function fixture(verifyMatch){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'awt-emergency-reuse-'));
 const root=path.join(temp,'installed');
 const recovery=path.join(temp,'recovery');
 const marker=path.join(temp,'capture-called');
 const controller=path.join(root,'scripts','emergency-control.cjs');
 fs.mkdirSync(path.dirname(controller),{recursive:true});
 fs.writeFileSync(path.join(root,'install-state.txt'),'1.0.999\n');
 fs.writeFileSync(path.join(root,'install-manifest.sha256'),'a'.repeat(64)+'\n');
 fs.writeFileSync(controller,`const fs=require('fs');const action=process.argv[2];
if(action==='verify'){const good=process.env.VERIFY_MATCH==='1';console.log(JSON.stringify({ok:good,health:{ok:good},receipt:{version:'1.0.999',manifestSha:'a'.repeat(64),sourceRoot:process.env.ROOT}}));}
else if(action==='capture'){fs.writeFileSync(process.env.CAPTURE_MARKER,'yes');console.log(JSON.stringify({ok:true}));}
`);
 try {
  const sh=[`export ROOT=${q(root)}`,`RECOVERY_ROOT=${q(recovery)}`,`AWTSMOOS_NODE_BIN=${q(process.execPath)}`,
   'AWTSMOOS_REUSE_VERIFIED_RECOVERY_LANES=1',
   'install_recovery_commands(){ return 0; }','install_event(){ :; }','prg_ok(){ :; }',
   'run_with_timeout(){ shift 2; [ "$1" = "--" ] && shift; "$@"; }',
   `source ${q(source)}`,'refresh_emergency_runtime'].join('\n');
  const r=spawnSync('/bin/bash',['-c',sh],{encoding:'utf8',timeout:4500,env:{...process.env,VERIFY_MATCH:verifyMatch?'1':'0',CAPTURE_MARKER:marker}});
  return {status:r.status,stderr:r.stderr,captured:fs.existsSync(marker),stdout:r.stdout};
 } finally {fs.rmSync(temp,{recursive:true,force:true});}
}
test('same signed emergency slot is verified and reused without recapturing',()=>{
 const r=fixture(true);assert.equal(r.status,0,r.stderr);assert.equal(r.captured,false);
});
test('failed seal verification still captures a fresh emergency slot',()=>{
 const r=fixture(false);assert.equal(r.status,0,r.stderr);assert.equal(r.captured,true);
});
