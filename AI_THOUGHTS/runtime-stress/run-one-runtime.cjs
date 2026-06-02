// B"H
const fs=require('fs');
const path=require('path');
const { pathToFileURL }=require('url');
const { loadConfig }=require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions }=require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
(async()=>{
 const target=process.argv[2];
 const service=await import(pathToFileURL(path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js')).href+'?one='+Date.now());
 const opts=await collectOptions({p:target,waitMs:0,timeoutMs:2000}, loadConfig());
 opts.waitMs=0; opts.functionTimeoutMs=1000;
 console.error('[Probe:afterCollect]', JSON.stringify({target,fileCount:Object.keys(opts.files||{}).length,entry:opts.entry}));
 const r=await service.simulateRuntime(opts);
 console.log(JSON.stringify({target,ok:r.ok,error:r.error,values:r.values,errors:(r.errors||[]).slice(0,4)},null,2));
})().catch(e=>{console.error('[Probe:caught]', e.stack||e.message);process.exit(1);});
