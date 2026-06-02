const fs=require('fs');
const path=require('path');
const { handleFsAction } = require(process.cwd() + '/geelooy/apps/tunnel/agent/tools/fs/actions.js');
const start=Number(process.argv[2]||0), take=Number(process.argv[3]||5);
const out='AI_THOUGHTS/runtime-stress/all-index-results.json';
function dirs(root){return fs.existsSync(root)?fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>path.join(root,d.name)).sort():[];}
function timeout(promise,ms){return Promise.race([promise,new Promise(r=>setTimeout(()=>r({ok:false,error:'harness_timeout'}),ms))]);}
function current(){try{return JSON.parse(fs.readFileSync(out,'utf8'));}catch{return {rows:[]};}}
async function runOne(p){const started=Date.now();const r=await timeout(handleFsAction({action:'simulateRuntime',p,timeoutMs:7000,waitMs:80,returnValues:['document.title']},null),10000);const err=(r.errors&&r.errors[0])||null;return{p,ms:Date.now()-started,ok:!!r.ok,engine:r.engine||'merkava',error:r.error||err?.message||null,topStack:err?.stack?String(err.stack).split('\n').slice(0,2).join('\n'):null,chromeRecommended:!!r.chromeRecommended};}
(async()=>{const targets=['geelooy/apps','geelooy/games'].flatMap(dirs).map(d=>path.join(d,'index.html')).filter(f=>fs.existsSync(f));const data=current();const seen=new Set((data.rows||[]).map(r=>r.p));const rows=data.rows||[];for(const p of targets.slice(start,start+take)){if(seen.has(p)) continue;const row=await runOne(p);rows.push(row);console.log(JSON.stringify(row));}const summary={generatedAt:new Date().toISOString(),total:targets.length,count:rows.length,ok:rows.filter(r=>r.ok).length,failed:rows.filter(r=>!r.ok).length,rows};fs.writeFileSync(out,JSON.stringify(summary,null,2));console.log('SUMMARY '+JSON.stringify({start,take,count:summary.count,total:summary.total,ok:summary.ok,failed:summary.failed}));})().catch(e=>{console.error(e.stack||e.message);process.exit(1);});
