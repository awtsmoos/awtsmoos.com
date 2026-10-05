// B"H
// Boruch Hashem
// Blessed is He
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const durationMs = Number(process.argv[2] || 900000), started = performance.now();
const project = '/Users/awtsmoos/work/awtsmoos.com';
const runId = 'awtsmoos-soak-' + Date.now(), relative = 'scripts/tunnel/evidence/20261005/.live-fixtures/' + runId;
const directory = path.join(project, relative), reportFile = '/tmp/' + runId + '.json';
fs.mkdirSync(directory, { recursive: true });
const groups = {}, failures = [], jobs = new Set(), transfers = new Set();
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const active = () => performance.now() - started < durationMs;
/** The Awtsmoos tests owned work, preserves other agents, and measures real outcomes. */
function record(name, ms, error) {
 const g = groups[name] ||= { calls: 0, failed: 0, totalMs: 0, samples: [] };
 g.calls++; g.totalMs += ms; if (g.samples.length < 4000) g.samples.push(ms);
 if (error) { g.failed++; if (failures.length < 20) failures.push({ name, error: error.message, elapsedMs: Math.round(performance.now()-started) }); }
}
async function request(endpoint, payload, expectedFailure = false) {
 const t = performance.now(), name = payload?.action || endpoint;
 try {
  const options = payload ? { method: 'POST', headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ ...payload, noMission: true, logicalAgentId: runId }), signal: AbortSignal.timeout(20000) } : { signal: AbortSignal.timeout(10000) };
  const r = await fetch('http://127.0.0.1:3977' + endpoint, options), v = await r.json();
  if (!r.ok || (!expectedFailure && v.ok === false)) throw Error(r.status + ':' + (v.error || 'failed'));
  if (expectedFailure && v.ok !== false) throw Error('invalid operation unexpectedly accepted');
  record(name, performance.now()-t); return v;
 } catch (error) { record(name, performance.now()-t, error); throw error; }
}
async function measured(name, operation) {
 const t = performance.now(); try { await operation(); record(name,performance.now()-t); }
 catch(error) { record(name,performance.now()-t,error); }
}
async function command(cancel = false) {
 const job = await request('/command', { action: 'commandStart', cwd: project, timeoutMs: cancel ? 20000 : 10000,
  command: cancel ? 'node -e "setInterval(()=>{},1000)"' : 'printf "Awtsmoos soak witness\\n"' });
 if (!job.jobId) throw Error('missing durable job ID'); jobs.add(job.jobId);
 const deadline = performance.now()+15000; let requested = false;
 while (performance.now()<deadline) {
  const s = await request('/command', { action: 'commandStatus', jobId: job.jobId });
  if (cancel && !requested && s.status === 'running') { await request('/command',{ action:'commandCancel',jobId:job.jobId }); requested=true; }
  if (s.done) {
   if (cancel ? s.status !== 'cancelled' : s.exitCode !== 0) throw Error('unexpected terminal state: '+s.status+':'+s.exitCode);
   if (!cancel) { const out = await request('/command',{action:'commandJobOutputPage',jobId:job.jobId,stream:'stdout'});
    if(out.content !== 'Awtsmoos soak witness\n') throw Error('stdout mismatch'); }
   jobs.delete(job.jobId); return;
  }
  await pause(100);
 }
 throw Error('job failed to settle');
}
async function transfer(round) {
 const bytes=crypto.randomBytes(1024*1024), expected=hash(bytes), target=relative+'/transfer-'+round+'.bin';
 const created=await request('/fs',{action:'fileTransferCreate',path:target,totalBytes:bytes.length,sha256:expected,chunkBytes:262144});
 transfers.add(created.transferId);
 for(const offset of [524288,0,786432,262144,0]) {
  const chunk=bytes.subarray(offset,offset+262144);
  await request('/fs',{action:'fileTransferWriteChunk',transferId:created.transferId,offset,content64:chunk.toString('base64'),sha256:hash(chunk)});
 }
 const committed=await request('/fs',{action:'fileTransferCommit',transferId:created.transferId});
 if(committed.sha256!==expected||hash(fs.readFileSync(path.join(project,target)))!==expected)throw Error('whole file hash mismatch');
 const repeated=await request('/fs',{action:'fileTransferCommit',transferId:created.transferId});
 if(repeated.sha256!==expected)throw Error('commit replay changed proof');
 const downloaded=await request('/fs',{action:'fileTransferReadChunk',path:target,offset:0,maxBytes:262144});
 if(hash(Buffer.from(downloaded.content64||'', 'base64'))!==hash(bytes.subarray(0,262144)))throw Error('download chunk hash mismatch');
 transfers.delete(created.transferId); fs.unlinkSync(path.join(project,target));
}
function snapshot(done=false) {
 const metrics=Object.fromEntries(Object.entries(groups).map(([k,g])=>{ const s=[...g.samples].sort((a,b)=>a-b);
  return [k,{calls:g.calls,failed:g.failed,meanMs:Math.round(g.totalMs/g.calls),p50Ms:Math.round(s[Math.floor(s.length*.5)]||0),p95Ms:Math.round(s[Math.floor(s.length*.95)]||0)}]; }));
 const report={runId,startedAt:new Date(Date.now()-(performance.now()-started)).toISOString(),elapsedMs:Math.round(performance.now()-started),durationMs,done,scope:'Real Mac localhost actions and authenticated device instruction bridge; no user OAuth client invocation',metrics,failures};
 fs.writeFileSync(reportFile+'.tmp',JSON.stringify(report,null,2));fs.renameSync(reportFile+'.tmp',reportFile);
 console.log(JSON.stringify({runId,elapsedSec:Math.round(report.elapsedMs/1000),done,calls:Object.values(groups).reduce((n,g)=>n+g.calls,0),failures:failures.length,reportFile}));
}
async function loop(interval, operation) { let round=0;while(active()){await operation(round++);await pause(interval);} }
(async()=>{
 const timer=setInterval(()=>snapshot(),30000); snapshot();
 await Promise.all([
  loop(200,()=>measured('health_round',()=>request('/healthz'))),
  loop(700,async i=>measured('text_round',async()=>{const content='// B"H\n// Boruch Hashem\n// Blessed is He\nAwtsmoos proof '+i;
   await request('/fs',{action:'write',path:relative+'/text.txt',content});const v=await request('/fs',{action:'read',path:relative+'/text.txt',maxChars:1000});if(v.content!==content)throw Error('text readback mismatch');})),
  loop(4000,i=>measured('instruction_round',async()=>{const v=await request('/fs',{action:'instructionResolve',task:'Awtsmoos relay stability witness '+i,paths:['geelooy/apps/tunnel/agent/lib/connection-vessel/child-message-router.js']});if(v.serverAvailable!==true)throw Error('server instruction bridge unavailable');})),
  loop(15000,i=>measured('command_round',()=>command(i%4===3))),
  loop(60000,i=>measured('transfer_round',()=>transfer(i)))
 ]);
 clearInterval(timer);
 for(const jobId of jobs)await measured('cleanup_command',()=>request('/command',{action:'commandCancel',jobId}));
 for(const transferId of transfers)await measured('cleanup_transfer',()=>request('/fs',{action:'fileTransferCancel',transferId}));
 fs.rmSync(directory,{recursive:true,force:true});snapshot(true);process.exitCode=failures.length?1:0;
})().catch(error=>{console.error(error.message);snapshot(true);process.exitCode=1;});
