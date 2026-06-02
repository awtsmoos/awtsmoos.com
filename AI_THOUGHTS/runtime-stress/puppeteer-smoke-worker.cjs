// B"H
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const page = process.argv[2];
const capMs = Number(process.env.MERKAVA_PUPPETEER_SMOKE_MS || 30000);
function actions(){return [
  { action:'waitForSelector', selector:'body', timeoutMs:250 },
  { action:'waitForFunction', source:'document && document.body && document.body.children.length >= 0', timeoutMs:250 },
  { action:'evaluate', source:'({ title: document.title, bodyChildren: document.body ? document.body.children.length : -1, buttons: document.querySelectorAll("button").length, inputs: document.querySelectorAll("input, textarea, select").length })' },
  { action:'click', selector:'body', continueOnError:true },
  { action:'evaluate', source:'({ activeTag: document.activeElement ? document.activeElement.tagName : null, textSize: document.body ? document.body.textContent.length : 0 })' },
  { action:'snapshot' }
];}
(async()=>{
 const started=Date.now();
 const config=loadConfig();
 const servicePath=path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js');
 const service=await import(pathToFileURL(servicePath).href+'?worker='+Date.now());
 const options=await collectOptions({action:'simulateRuntime',p:page,waitMs:0,timeoutMs:capMs},config);
 options.waitMs=0; options.timeoutMs=capMs; options.browserActions=actions(); options.returnValues=['document.title'];
 const result=await service.simulateRuntime(options);
 const log=result.interactionLog||[];
 const failedAction=log.find(x=>x.ok===false&&!x.continueOnError);
 const row={p:page,at:new Date().toISOString(),ok:!!result.ok&&!failedAction,error:result.error||failedAction?.error||null,ms:Date.now()-started,actionCount:log.length,actions:log.map(x=>({action:x.action,ok:x.ok!==false,error:x.error||null}))};
 console.log(JSON.stringify(row));
 process.exit(row.ok?0:2);
})().catch(e=>{console.log(JSON.stringify({p:page,at:new Date().toISOString(),ok:false,error:e.message,stack:e.stack}));process.exit(1);});
