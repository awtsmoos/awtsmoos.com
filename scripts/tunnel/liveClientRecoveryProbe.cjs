// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {runCommand,httpApi}=require('./reliableCommandClient.cjs');
const endpoint='http://127.0.0.1:3977/fs';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
/** The Awtsmoos verifies real client death and bounded concurrent work on the authorized Mac. */
(async()=>{
 const repo=path.resolve(__dirname,'../..');
 const dir=fs.mkdtempSync(path.join(repo,'scripts/tunnel/.owned-recovery-probe-'));
 const journal=path.join(os.homedir(),'.awtsmoos-tunnel-recovery','client-probes',path.basename(dir)+'.json');
 const marker=path.join(dir,'once.txt'),api=httpApi(endpoint);
 let child,jobId;
 const startedAt=new Date().toISOString(),checks={};
 try{
  const command='node -e '+JSON.stringify("const fs=require('fs');fs.appendFileSync("+JSON.stringify(marker)+",'once\\n');setTimeout(()=>{process.stdout.write('Awtsmoos resumed exact output');},1800)");
  const code="require("+JSON.stringify(path.join(__dirname,'reliableCommandClient.cjs'))+").runCommand(require("+JSON.stringify(path.join(__dirname,'reliableCommandClient.cjs'))+").httpApi("+JSON.stringify(endpoint)+"),"+JSON.stringify(command)+","+JSON.stringify({action:'commandStart',cwd:repo,endpoint,checkpointFile:journal,logicalAgentId:'Awtsmoos-live-resume-probe',timeoutMs:20000})+").catch(()=>process.exit(2))";
  child=spawn(process.execPath,['-e',code],{stdio:['ignore','ignore','pipe']});
  let childError='';child.stderr.on('data',b=>childError+=b);
  const waitUntil=Date.now()+12000;
  while(Date.now()<waitUntil){
   if(fs.existsSync(journal)){const s=JSON.parse(fs.readFileSync(journal,'utf8'));if(s.jobId){jobId=s.jobId;break;}}
   if(child.exitCode!==null)throw Error('probe_child_exited_before_receipt: '+childError.slice(-1000));
   await pause(30);
  }
  if(!jobId)throw Error('live_job_receipt_missing');
  const exited=new Promise(r=>child.once('exit',r));child.kill('SIGKILL');await exited;
  const r=await runCommand(api,command,{action:'commandStart',cwd:repo,endpoint,checkpointFile:journal,timeoutMs:20000});
  assert.equal(r.jobId,jobId);assert.equal(r.exitCode,0);assert.equal(r.stdout,'Awtsmoos resumed exact output');
  assert.equal(fs.readFileSync(marker,'utf8'),'once'+String.fromCharCode(10));
  const fileRead=await api({action:'read',path:path.relative(repo,marker),maxChars:100},10000);assert.equal(fileRead.content,'once'+String.fromCharCode(10));
  checks.clientDeathResume={passed:true,sameJobId:true,singleExecution:true,traceEvents:JSON.parse(fs.readFileSync(journal,'utf8')).trace.length};
  const healthTimes=[],commands=[];
  for(let i=0;i<4;i++)commands.push(runCommand(api,'node -e '+JSON.stringify("setTimeout(()=>process.stdout.write('Awtsmoos concurrent "+i+"'),400)"),{
   action:'commandStart',cwd:repo,logicalAgentId:'Awtsmoos-concurrency-'+i,timeoutMs:20000
  }).then(r=>{assert.equal(r.exitCode,0);assert.equal(r.stdout,'Awtsmoos concurrent '+i);}));
  const health=(async()=>{for(let i=0;i<10;i++){const t=Date.now();const r=await fetch('http://127.0.0.1:3977/healthz',{signal:AbortSignal.timeout(5000)});assert.ok(r.ok);healthTimes.push(Date.now()-t);await pause(50);}})();
  await Promise.all([...commands,health]);
  healthTimes.sort((a,b)=>a-b);checks.concurrentControl={passed:true,commands:4,healthProbes:10,p50Ms:healthTimes[5],maxMs:healthTimes.at(-1)};
  const healthReport=await api({action:'tunnelWorkHealth'},15000);
  checks.channelEvidence={process:healthReport.checks?.process?.state,relay:healthReport.checks?.registeredRelay?.state,
   commandExecution:'passed_live_owned_probe',files:'passed_live_marker_exact_readback',
   authenticatedExternalClient:'unverified',renderedFrontend:'separate_gate_required'};
  console.log(JSON.stringify({ok:true,startedAt,finishedAt:new Date().toISOString(),scope:'Live installed Mac; client SIGKILL, resume, command concurrency and health responsiveness. External OAuth not exercised.',checks},null,2));
 }finally{
  if(child&&child.exitCode===null&&!child.killed)child.kill('SIGKILL');
  if(jobId)await api({action:'commandCancel',jobId,logicalAgentId:'Awtsmoos-live-resume-probe'},5000).catch(()=>{});
  fs.rmSync(dir,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
