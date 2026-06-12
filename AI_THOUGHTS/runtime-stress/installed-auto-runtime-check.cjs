// B"H
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');
const repoRoot = process.cwd();
const home = path.join(repoRoot,'AI_THOUGHTS/runtime-stress/.tmp-windows-localhost-install/home');
const entry = path.join(home,'.awtsmoos-tunnel/main.js');
const apiPort=3988;
async function fetchJson(url, options={}){const r=await fetch(url,options);const t=await r.text();if(!r.ok)throw new Error(`${r.status}: ${t}`);return JSON.parse(t)}
function tool(action,args={}){return fetchJson(`http://127.0.0.1:${apiPort}/tool`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,arguments:args})})}
function start(){return spawn(process.execPath,[entry],{cwd:repoRoot,env:{...process.env,USERPROFILE:home,AWTSMOOS_LOCAL_API:'1',AWTSMOOS_LOCAL_API_PORT:String(apiPort)},stdio:['ignore','ignore','ignore']})}
async function waitHealth(child){const s=Date.now();while(Date.now()-s<30000){if(child.exitCode!==null)throw new Error('agent exited');try{return await fetchJson(`http://127.0.0.1:${apiPort}/health`)}catch{await new Promise(r=>setTimeout(r,400))}}throw new Error('health timeout')}
(async()=>{const child=start();try{await waitHealth(child);const started=Date.now();const r=await tool('simulateRuntime',{engine:'auto',html:'<body><div id="ok">AUTO INSTALLED</div></body>',returnValues:JSON.stringify(['document.querySelector("#ok").textContent']),timeoutMs:10000,autoChromeTimeoutMs:1000});const ms=Date.now()-started;assert.equal(r.ok,true,JSON.stringify(r));assert.ok(['chrome','node-dom','merkava'].includes(r.engine), 'unexpected engine '+r.engine);assert.ok(ms<10000,'auto runtime too slow '+ms);console.log(JSON.stringify({ok:true,ms,engine:r.engine,autoRuntime:r.autoRuntime,attemptedEngines:r.attemptedEngines,values:r.values},null,2));}finally{child.kill();}})().catch(e=>{console.error(JSON.stringify({ok:false,error:e.message,stack:e.stack},null,2));process.exit(1)});