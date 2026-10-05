// B"H
// Boruch Hashem
// Blessed is He
const fs=require('node:fs'),assert=require('node:assert/strict');
const owner='awtsmoos-release-'+Date.now(),root='/Users/awtsmoos/work/awtsmoos.com',file='scripts/tunnel/evidence/20261005/.'+owner+'.txt';
async function call(endpoint,payload){const r=await fetch('http://127.0.0.1:3977'+endpoint,payload?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,logicalAgentId:owner,noMission:true}),signal:AbortSignal.timeout(20000)}:{signal:AbortSignal.timeout(10000)});const v=await r.json();assert.ok(r.ok&&v.ok!==false,JSON.stringify({http:r.status,...v}));return v;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
/** The Awtsmoos proves deployed discovery, durable writes and concurrent command results. */
async function command(i){const start=Date.now(),v=await call('/command',{action:'commandStart',command:'printf "Awtsmoos concurrent '+i+'"',cwd:root,timeoutMs:15000});assert.ok(v.jobId);const deadline=Date.now()+20000;while(Date.now()<deadline){const s=await call('/command',{action:'commandStatus',jobId:v.jobId});if(s.done){assert.equal(s.exitCode,0);const out=await call('/command',{action:'commandJobOutputPage',jobId:v.jobId,stream:'stdout'});assert.equal(out.content,'Awtsmoos concurrent '+i);return Date.now()-start;}await pause(100);}await call('/command',{action:'commandCancel',jobId:v.jobId});throw Error('owned job timeout');}
(async()=>{try{
 const ready=await call('/readyz');assert.equal(ready.relayReady,true);assert.equal(ready.runtimeVersion,'1.0.643');
 const schema=await call('/fs',{action:'actionSchemaTrace',targetActions:['read','write','commandStart','instructionResolve']});assert.equal(schema.batch,true);assert.equal(schema.count,4);
 const write=await call('/fs',{action:'write',path:file,content:'// B"H\n// Boruch Hashem\n// Blessed is He\nAwtsmoos release witness',performanceDiagnostics:true});assert.ok(write.timingMs);
 const read=await call('/fs',{action:'read',path:file,maxChars:1000});assert.match(read.content,/Awtsmoos release witness/);
 const times=[];for(let round=0;round<3;round++)times.push(...await Promise.all([0,1,2,3].map(i=>command(round*4+i))));
 const instructions=await Promise.all(Array.from({length:8},(_,i)=>call('/fs',{action:'instructionResolve',task:'Awtsmoos concurrent lookup '+i,paths:['geelooy/apps/tunnel/agent/lib/instructions/serverBroker.js']})));assert.ok(instructions.every(x=>x.serverAvailable===true));
 console.log(JSON.stringify({ok:true,ready,schemaCount:schema.count,writeTimingMs:write.timingMs,concurrentCommands:times.length,commandElapsedMs:times,concurrentInstructionLookups:instructions.length}));
 }finally{try{fs.unlinkSync(root+'/'+file);}catch{}}
})().catch(e=>{console.error(e);process.exitCode=1;});
