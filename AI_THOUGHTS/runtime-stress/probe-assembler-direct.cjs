// B"H
const fs=require('fs');
const { loadConfig }=require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions }=require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const { RuntimeAssembler }=require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js');
(async()=>{
 const target=process.argv[2];
 const opts=await collectOptions({p:target,waitMs:0}, loadConfig());
 opts.waitMs=0; opts.functionTimeoutMs=1000;
 const asm=new RuntimeAssembler(opts);
 console.error('[direct] afterCollect', JSON.stringify({target,fileCount:Object.keys(opts.files).length}));
 const started=Date.now();
 const raw=await asm.run(opts.entry);
 console.error('[direct] afterRun', JSON.stringify({ms:Date.now()-started, ok:raw.ok, errors:(raw.runtime.errors||[]).slice(0,2), timers:raw.runtime.window&&raw.runtime.window.__timers&&raw.runtime.window.__timers.size}));
 console.log(JSON.stringify({target,ok:raw.ok,ms:Date.now()-started, errors:(raw.runtime.errors||[]).slice(0,3), console:(raw.console||[]).slice(-5)},null,2));
})().catch(e=>{console.error('[direct:caught]',e.stack||e.message);process.exit(1);});
