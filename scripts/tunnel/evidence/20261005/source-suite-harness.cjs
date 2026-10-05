//B"H
//Boruch Hashem
//Blessed is He
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=process.cwd(),out=path.join(root,'scripts/tunnel/evidence/20261005');
const areas=['geelooy/api/tunnel/control','geelooy/api/oauth','geelooy/apps/tunnel/agent/lib','geelooy/apps/tunnel/agent/recovery','geelooy/apps/tunnel/agent/tools/fs/test','geelooy/apps/tunnel/agent/tools/command','scripts/tunnel/testing'];
function walk(d){if(!fs.existsSync(d))return[];return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!e.name.startsWith('.')?walk(path.join(d,e.name)):e.isFile()&&/\.test\.(cjs|mjs|js)$/.test(e.name)?[path.join(d,e.name)]:[])}
const files=[...new Set(areas.flatMap(walk))];
for(const p of ['geelooy/apps/tunnel/agent/tools/fs/testing/all-actions-source-stress.test.cjs','geelooy/apps/tunnel/agent/tools/fs/testing/action-registry-stress.test.cjs','scripts/stress-tunnel-control-actions.mjs','scripts/stress-virtual-os-parity.mjs','scripts/stress-command-router-actions.mjs','scripts/stress-command-no-504.mjs'])files.push(p);
fs.writeFileSync(path.join(out,'source-suite-inventory.json'),JSON.stringify({createdAt:new Date().toISOString(),sourceCommit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files},null,2));
const results=[];
(async()=>{for(let i=0;i<files.length;i++){const file=files[i],start=Date.now();const r=cp.spawnSync(process.execPath,['--test','--test-reporter=tap',file],{cwd:root,encoding:'utf8',timeout:45000,maxBuffer:3*1024*1024,env:{...process.env,NODE_OPTIONS:''}});const stdout=r.stdout||'',stderr=r.stderr||'';const result={file,status:r.status,signal:r.signal,error:r.error?.code,durationMs:Date.now()-start,tests:Number(stdout.match(/# tests (\d+)/)?.[1]||0),pass:Number(stdout.match(/# pass (\d+)/)?.[1]||0),fail:Number(stdout.match(/# fail (\d+)/)?.[1]||0)};results.push(result);if(r.status!==0)fs.writeFileSync(path.join(out,'failure-'+i+'.log'),stdout+stderr);fs.writeFileSync(path.join(out,'source-suite-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({index:i+1,total:files.length,...result}));}console.log(JSON.stringify({complete:true,files:results.length,passedFiles:results.filter(x=>x.status===0).length,failedFiles:results.filter(x=>x.status!==0).length}));})();
