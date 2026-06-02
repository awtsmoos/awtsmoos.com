// B"H
const fs=require('fs');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const { RuntimeAssembler } = require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js');
const outFile='AI_THOUGHTS/runtime-stress/trace-captions-result.json';
const keep=setTimeout(()=>{fs.writeFileSync(outFile,JSON.stringify({timeout:true},null,2));process.exit(3);},7000);
(async()=>{
 const options=await collectOptions({p:'geelooy/apps/captions/index.html',waitMs:0}, loadConfig());
 const asm=new RuntimeAssembler({files:options.files,entry:options.entry,runtime:'browser',waitMs:0,functionTimeoutMs:3000});
 const assembly=asm.assemble(options.entry);
 const pre={fileCount:Object.keys(options.files).length, hasSource:options.files[options.entry].includes('id="einSofWorker"'), plan:assembly.html.executionPlan.map(x=>({type:x.type,inline:x.inline,src:x.src,resolved:x.resolved,codeHead:(x.code||'').slice(0,40)}))};
 const result=await asm.run(options.entry);
 const el=result.runtime.window.document.getElementById('einSofWorker');
 const row={pre, ok:result.ok, hasEl:!!el, tag:el&&el.localName, textLen:el&&el.textContent&&el.textContent.length, errors:result.runtime.errors.slice(0,5), current:result.runtime.__merkavaCurrentStep, last:result.runtime.__merkavaLastCompletedStep};
 fs.writeFileSync(outFile,JSON.stringify(row,null,2));
 clearTimeout(keep);
 console.log(JSON.stringify(row,null,2));
 process.exit(0);
})().catch(e=>{fs.writeFileSync(outFile,JSON.stringify({caught:e.message,stack:e.stack},null,2));clearTimeout(keep);console.error(e.stack||e.message);process.exit(1);});
