// B"H
const fs=require('fs');
const path=require('path');
const { pathToFileURL }=require('url');
const { loadConfig }=require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions }=require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const page='geelooy/games/Merkava/index.html';
const sets={
  runtime:[],
  body:[{action:'waitForSelector',selector:'body',timeoutMs:250}],
  eval:[{action:'waitForSelector',selector:'body',timeoutMs:250},{action:'evaluate',source:'({title:document.title,children:document.body.children.length})'}],
  click:[{action:'waitForSelector',selector:'body',timeoutMs:250},{action:'evaluate',source:'({title:document.title,children:document.body.children.length})'},{action:'click',selector:'body',continueOnError:true}],
  snapshot:[{action:'waitForSelector',selector:'body',timeoutMs:250},{action:'evaluate',source:'({title:document.title,children:document.body.children.length})'},{action:'snapshot'}]
};
async function run(name, browserActions){
 const started=Date.now();
 const service=await import(pathToFileURL(path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js')).href+'?iso='+Date.now()+name);
 const options=await collectOptions({p:page,waitMs:0,timeoutMs:20000},loadConfig());
 options.waitMs=0; options.timeoutMs=20000; options.browserActions=browserActions;
 const result=await service.simulateRuntime(options);
 return {name,ok:!!result.ok,error:result.error||(result.errors||[])[0]?.message||null,ms:Date.now()-started,actions:(result.interactionLog||[]).map(x=>({action:x.action,ok:x.ok,error:x.error}))};
}
(async()=>{
 const rows=[];
 for(const [name, actions] of Object.entries(sets)) rows.push(await run(name,actions));
 fs.writeFileSync('AI_THOUGHTS/runtime-stress/merkava-smoke-isolate.json',JSON.stringify(rows,null,2));
 console.log(JSON.stringify(rows,null,2));
})();
