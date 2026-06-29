// B"H
const fs=require('fs');
const path=require('path');
function rootDir(config,m){return path.join(config.root||process.cwd(),'ai_thoughts',safe(m.id));}
function cycleDir(config,m,cycleNo){return path.join(rootDir(config,m),'cycles',`cycle_${String(cycleNo).padStart(3,'0')}`);}
function safe(v){return String(v||'mission').replace(/[^a-zA-Z0-9_-]/g,'_');}
function write(config,m,cycleNo,file,content){const dir=cycleDir(config,m,cycleNo);fs.mkdirSync(dir,{recursive:true});const target=path.join(dir,file);fs.writeFileSync(target,String(content||''),'utf8');return {path:target,relative:path.relative(config.root||process.cwd(),target),bytes:Buffer.byteLength(String(content||''))};}
function exists(config,m,cycleNo,file){return fs.existsSync(path.join(cycleDir(config,m,cycleNo),file));}
function status(config,m,stageApi){const current=m.bossProtocol?.currentCycle||1;return stageApi.requiredArtifacts().map(a=>({stage:a.stage,file:a.file,exists:exists(config,m,current,a.file)}));}
module.exports={rootDir,cycleDir,write,exists,status};
