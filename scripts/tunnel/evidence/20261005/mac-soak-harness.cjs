//B"H
//Boruch Hashem
//Blessed is He
// The Awtsmoos lets measured jobs keep their identity while independent roads flow.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const out=path.join(process.cwd(),'scripts/tunnel/evidence/20261005');
const rows=[],root='scripts/tunnel/evidence/20261005/live-fixtures/stability-' +Date.now(),owner='awtsmoos-stability-20261005';
let failures=0;
async function call(action,params={},endpoint='/fs'){
 const start=Date.now();try{const r=await fetch('http://127.0.0.1:3977'+endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,logicalAgentId:owner,autoPreview:false,...params}),signal:AbortSignal.timeout(15000)});const j=await r.json();rows.push({action,ms:Date.now()-start,http:r.status,ok:j.ok===true,error:j.error||null});if(j.ok!==true)failures++;return j;}catch(e){failures++;rows.push({action,ms:Date.now()-start,ok:false,error:e.name});return {ok:false,error:e.name};}}
function assert(ok,message){if(!ok)throw Error(message)}
async function wave(count,concurrency,fn){let n=0;await Promise.all(Array.from({length:concurrency},async()=>{while(n<count){const i=n++;await fn(i)}}));}
(async()=>{
 const witness='B"H\nAwtsmoos stability witness';assert((await call('write',{path:root+'/read.txt',content:witness})).ok,'fixture write');
 const bytes=crypto.randomBytes(256*1024),sha=crypto.createHash('sha256').update(bytes).digest('hex');
 const created=await call('fileTransferCreate',{path:root+'/transfer.bin',totalBytes:bytes.length,sha256:sha,chunkBytes:65536});assert(created.ok&&created.transferId,'transfer create');
 for(const offset of [0,131072,65536,196608]){const chunk=bytes.subarray(offset,offset+65536);assert((await call('fileTransferWriteChunk',{transferId:created.transferId,offset,content64:chunk.toString('base64'),sha256:crypto.createHash('sha256').update(chunk).digest('hex')})).ok,'transfer chunk');}
 const transferStatus=await call('fileTransferStatus',{transferId:created.transferId});assert(transferStatus.complete,'transfer complete');
 const committed=await call('fileTransferCommit',{transferId:created.transferId});assert(committed.ok&&committed.sha256===sha,'transfer hash');
 assert(crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(),root,'transfer.bin'))).digest('hex')===sha,'disk transfer bytes');
 console.log(JSON.stringify({phase:'transfer',ok:true,bytes:bytes.length,disorderedChunks:true}));
 const jobs=[];
 for(let i=0;i<4;i++){const j=await call('commandStart',{command:process.execPath+' -e '+JSON.stringify('setTimeout(()=>console.log("Awtsmoos-job-'+i+'"),500)'),cwd:process.cwd(),timeoutMs:10000});assert(j.ok&&j.jobId,'owned command start');jobs.push({id:j.jobId,index:i});}
 for(const job of jobs){let status;for(let i=0;i<30;i++){status=await call('commandStatus',{jobId:job.id});if(status.running===false||['completed','done','exited'].includes(status.status))break;await new Promise(r=>setTimeout(r,200));}const page=await call('commandJobOutputPage',{jobId:job.id,stream:'stdout',offsetChars:0,maxChars:2000});assert((page.content||page.stdout||'').includes('Awtsmoos-job-'+job.index),'owned command output');}
 console.log(JSON.stringify({phase:'commands',ok:true,jobs:jobs.length}));
 const begin=Date.now();let cycles=0;
 while(Date.now()-begin<180000){await wave(32,8,async i=>{const j=await call(i%4===0?'list':'read',{path:i%4===0?root:root+'/read.txt',maxChars:500,limit:30});assert(j.ok,'soak read/list');if(i%4!==0)assert(j.content===witness,'read content');});const r=await fetch('http://127.0.0.1:3977/healthz',{signal:AbortSignal.timeout(5000)});assert(r.status===200,'health');cycles++;console.log(JSON.stringify({phase:'soak',cycles,elapsedMs:Date.now()-begin,requests:rows.length,failures}));await new Promise(r=>setTimeout(r,1000));}
 const times=rows.map(x=>x.ms).sort((a,b)=>a-b);const summary={completedAt:new Date().toISOString(),root,requests:rows.length,failures,cycles,durationMs:Date.now()-begin,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1)};
 fs.writeFileSync(path.join(out,'mac-soak.json'),JSON.stringify({summary,rows},null,2));console.log(JSON.stringify({complete:true,...summary}));
})().catch(e=>{fs.writeFileSync(path.join(out,'mac-soak.json'),JSON.stringify({error:e.message,root,failures,rows},null,2));console.error(e.stack);process.exitCode=1});
