// B"H
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Policy=require('./static-deploy-safety.cjs');
test('web-only builds may deploy without terminating tunnel websocket server',()=>{
 assert(Policy.eligible(['geelooy/games/mitzvahWorld/build/build-js.cjs','geelooy/games/mitzvahWorld/experiments/Awtsmoos/index.html']));
 assert(Policy.eligible(['geelooy/apps/rebbe/styles/ui.css','geelooy/shliach-plugin/index.html']));
});
test('any server, installer, websocket, or mixed modification requires full activation',()=>{
 for(const files of [[],['index.js'],['ayzarim/awtsmoosDynamicServer/websocket/index.js'],['geelooy/api/tunnel/control/routes/index.js'],['scripts/production/remote-deploy-worker.sh'],['geelooy/apps/tunnel/agent/manifest.txt'],['geelooy/games/mitzvahWorld/index.html','ayzarim/awtsmoosDynamicServer/server.js']])assert.equal(Policy.eligible(files),false);
});
test('marker is bound to both specific checked-out SHA and living server PID',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'awts-static-marker-'));
 try{const file=path.join(tmp,'nested','static.json'),sha='1'.repeat(40);Policy.mark(file,sha,456);assert(Policy.matches(file,sha,456));assert(!Policy.matches(file,'2'.repeat(40),456));assert(!Policy.matches(file,sha,457));}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('renaming server source into a static folder never disguises a backend mutation',()=>{
 const cp=require('node:child_process');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'awts-static-rename-'));
 const git=(...args)=>{const r=cp.spawnSync('git',args,{cwd:tmp,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
 try{
  git('init','-q');git('config','user.email','test@local.invalid');git('config','user.name','Local Test');
  fs.mkdirSync(path.join(tmp,'ayzarim'),{recursive:true});fs.writeFileSync(path.join(tmp,'ayzarim','server.js'),'SERVER');
  git('add','.');git('commit','-qm','before');const before=git('rev-parse','HEAD');
  fs.mkdirSync(path.join(tmp,'geelooy/games/mitzvahWorld'),{recursive:true});
  git('mv','ayzarim/server.js','geelooy/games/mitzvahWorld/server.js');git('commit','-qm','rename');
  const after=git('rev-parse','HEAD');assert.equal(Policy.eligibleRange(tmp,before,after),false);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
