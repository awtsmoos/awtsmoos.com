// B"H
const fs=require('fs');
const path=require('path');
const { pathToFileURL }=require('url');
const { loadConfig }=require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions }=require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const out='AI_THOUGHTS/runtime-stress/trace-timeouts.jsonl';
fs.writeFileSync(out,'');
const targets=process.argv.slice(2);
function trace(row){ fs.appendFileSync(out,JSON.stringify({...row,at:new Date().toISOString()})+'\n'); console.log(JSON.stringify(row)); }
function cap(p,ms,stage){ return Promise.race([p,new Promise(r=>setTimeout(()=>r({__timeout:true,stage,ms}),ms))]); }
(async()=>{
 const config=loadConfig();
 const service=await import(pathToFileURL(path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js')).href+'?t='+Date.now());
 for(const target of targets){
   const start=Date.now(); trace({target,stage:'start'});
   const opts=await cap(collectOptions({p:target,waitMs:0,timeoutMs:3000},config),4000,'collectOptions');
   if(opts.__timeout){trace({target,stage:'timeout',where:opts.stage,ms:Date.now()-start});continue;}
   trace({target,stage:'afterCollect',fileCount:Object.keys(opts.files||{}).length,entry:opts.entry,ms:Date.now()-start});
   opts.waitMs=0; opts.functionTimeoutMs=1500;
   const res=await cap(service.simulateRuntime(opts),2500,'simulateRuntime');
   if(res.__timeout){trace({target,stage:'timeout',where:res.stage,fileCount:Object.keys(opts.files||{}).length,ms:Date.now()-start});continue;}
   trace({target,stage:'done',ok:res.ok,error:res.error,errors:(res.errors||[]).slice(0,2),ms:Date.now()-start});
 }
})().catch(e=>{trace({stage:'caught',error:e.message,stack:e.stack});process.exit(1);});
