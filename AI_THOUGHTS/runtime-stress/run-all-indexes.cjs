const fs=require('fs');
const path=require('path');
const { handleFsAction } = require(process.cwd() + '/geelooy/apps/tunnel/agent/tools/fs/actions.js');
const roots=['geelooy/apps','geelooy/games'];
const out='AI_THOUGHTS/runtime-stress/all-index-results.json';
function dirs(root){return fs.existsSync(root)?fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>path.join(root,d.name)).sort():[];}
function timeout(promise, ms){return Promise.race([promise,new Promise(r=>setTimeout(()=>r({ok:false,error:'harness_timeout',timeoutMs:ms}),ms))]);}
async function runOne(p){
 const started=Date.now();
 const r=await timeout(handleFsAction({action:'simulateRuntime',p,timeoutMs:7000,waitMs:80,returnValues:['document.title']},null),10000);
 const err=(r.errors&&r.errors[0])||null;
 return {p,ms:Date.now()-started,ok:!!r.ok,engine:r.engine||'merkava',error:r.error||err?.message||null,topStack:err?.stack?String(err.stack).split('\n').slice(0,2).join('\n'):null,chromeRecommended:!!r.chromeRecommended};
}
(async()=>{
 const targets=roots.flatMap(dirs).map(d=>path.join(d,'index.html')).filter(f=>fs.existsSync(f));
 const rows=[];
 for(const p of targets){ const row=await runOne(p); rows.push(row); fs.writeFileSync(out,JSON.stringify({generatedAt:new Date().toISOString(),count:rows.length,total:targets.length,rows},null,2)); console.log(JSON.stringify(row)); }
 const summary={generatedAt:new Date().toISOString(),total:targets.length,ok:rows.filter(r=>r.ok).length,failed:rows.filter(r=>!r.ok).length,rows};
 fs.writeFileSync(out,JSON.stringify(summary,null,2));
 console.log('FINAL '+JSON.stringify({total:summary.total,ok:summary.ok,failed:summary.failed,out},null,2));
})().catch(e=>{console.error(e.stack||e.message);process.exit(1);});
