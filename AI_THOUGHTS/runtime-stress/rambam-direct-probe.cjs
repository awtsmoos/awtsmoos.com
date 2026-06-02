// B"H
const fs = require('fs');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const { RuntimeAssembler } = require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js');
(async()=>{
 const target='geelooy/games/rambam/kiddushHachodesh/12/index.html';
 const started=Date.now();
 const options=await collectOptions({p:target,waitMs:0,timeoutMs:20000}, loadConfig());
 const asm=new RuntimeAssembler({...options,waitMs:0,functionTimeoutMs:4000});
 const result=await asm.run(options.entry);
 const row={ok:result.ok,ms:Date.now()-started,errors:(result.runtime.errors||[]).slice(0,5),last:result.runtime.__merkavaLastCompletedStep,current:result.runtime.__merkavaCurrentStep};
 fs.writeFileSync('AI_THOUGHTS/runtime-stress/rambam-direct-probe.json',JSON.stringify(row,null,2));
 console.log(JSON.stringify(row,null,2));
})().catch(e=>{fs.writeFileSync('AI_THOUGHTS/runtime-stress/rambam-direct-probe.json',JSON.stringify({ok:false,error:e.message,stack:e.stack},null,2)); console.error(e.stack||e.message); process.exit(1);});
