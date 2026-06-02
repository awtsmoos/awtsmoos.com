const fs=require('fs');
const { handleFsAction } = require(process.cwd() + '/geelooy/apps/tunnel/agent/tools/fs/actions.js');
const p=process.argv[2];
const out='AI_THOUGHTS/runtime-stress/results.jsonl';
function timeout(promise, ms){ return Promise.race([promise,new Promise(r=>setTimeout(()=>r({ok:false,error:'harness_timeout',timeoutMs:ms}),ms))]); }
(async()=>{
 const started=Date.now();
 const payload={action:'simulateRuntime',p,timeoutMs:8000,waitMs:100,returnValues:['document.title','document.body ? document.body.children.length : -1']};
 const r=await timeout(handleFsAction(payload,null),12000);
 const row={at:new Date().toISOString(),p,ms:Date.now()-started,ok:r.ok,engine:r.engine||r.result?.engine||r.action,error:r.error||null,message:r.message||null,chromeRecommended:r.chromeRecommended||false,diagnostics:(r.diagnostics||r.virtualEnv?.diagnostics||[]).slice(0,2)};
 fs.appendFileSync(out,JSON.stringify(row)+'\n');
 console.log(JSON.stringify(row,null,2));
 process.exit(row.error==='harness_timeout'?2:0);
})().catch(e=>{console.error(e.stack||e.message);process.exit(1);});
