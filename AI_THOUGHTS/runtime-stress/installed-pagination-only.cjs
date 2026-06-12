// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const repoRoot = process.cwd();
const home = path.join(repoRoot, 'AI_THOUGHTS/runtime-stress/.tmp-windows-localhost-install/home');
const installRoot = path.join(home, '.awtsmoos-tunnel');
const entry = path.join(installRoot, 'main.js');
const apiPort = 3988;
async function fetchJson(url, options = {}) { const r = await fetch(url, options); const t = await r.text(); if(!r.ok) throw new Error(`${r.status}: ${t}`); return JSON.parse(t); }
function tool(action, args = {}) { return fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ action, arguments: args }) }); }
function startAgent(){ return spawn(process.execPath,[entry],{cwd:repoRoot,env:{...process.env,USERPROFILE:home,AWTSMOOS_LOCAL_API:'1',AWTSMOOS_LOCAL_API_PORT:String(apiPort)},stdio:['ignore','ignore','ignore']}); }
async function waitHealth(child){ const started=Date.now(); while(Date.now()-started<30000){ if(child.exitCode!==null) throw new Error('agent exited'); try{return await fetchJson(`http://127.0.0.1:${apiPort}/health`)}catch{await new Promise(r=>setTimeout(r,400));}} throw new Error('health timeout'); }
async function pages(first, max=12){ let arr=[first], cur=first; for(let i=0;i<max;i++){ const p=cur.nextPagePayload||cur.nextRequest||cur.nextScanRequest; if(!p) break; cur=await tool(p.action||first.action,p); arr.push(cur);} return arr; }
function existingStressPaths(rel){ const root=path.join(repoRoot,rel); return fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(d=>d.isFile() && d.name.endsWith('.js')).map(d=>path.relative(repoRoot,path.join(d.parentPath||d.path,d.name)).replace(/\\/g,'/')).slice(0,50); }
(async()=>{ const child=startAgent(); try{ await waitHealth(child); const rel='AI_THOUGHTS/runtime-stress/.tmp-pagination-tree'; assert.ok(fs.existsSync(rel),'stress dataset missing'); const tree=await tool('tree',{p:rel,depth:5,pageSize:20,cursor:0}); assert.equal(tree.ok,true); const treePages=await pages(tree,10); const search=await tool('search',{path:rel,query:'AWTS_STRESS_',pageSize:25,maxResults:25,maxFiles:60}); assert.equal(search.ok,true); const searchPages=await pages(search,10); const paths=existingStressPaths(rel).join('\n'); const bulk=await tool('bulk',{paths,pageSize:10,maxFiles:10,maxChars:500,totalMaxChars:5000}); assert.equal(bulk.ok,true,JSON.stringify(bulk).slice(0,1000)); const bulkPages=await pages(bulk,10); const conn=await tool('connectedFiles',{path:`${rel}/src/entry.js`,maxDepth:2,pageSize:2,maxFiles:10,maxBytes:8000}); assert.equal(conn.ok,true); console.log(JSON.stringify({ok:true,tree:{pages:treePages.length,partial:tree.partial,rows:treePages.reduce((n,p)=>n+(p.returnedRows||0),0)},search:{pages:searchPages.length,partial:search.partial,returned:searchPages.reduce((n,p)=>n+(p.returnedResults||0),0)},bulk:{pages:bulkPages.length,partial:bulk.partial,returned:bulkPages.reduce((n,p)=>n+(p.returnedCount||0),0)},connectedFiles:{count:conn.count,returnedCount:conn.returnedCount,partial:conn.partial}},null,2)); } finally { child.kill(); } })().catch(e=>{console.error(JSON.stringify({ok:false,error:e.message,stack:e.stack},null,2));process.exit(1);});
