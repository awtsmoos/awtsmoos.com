// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const {runCommand,httpApi}=require('./reliableCommandClient.cjs');
const opts={pause:async()=>{},timeoutMs:1000,logicalAgentId:'Awtsmoos-test-owner'};
test('inline empty successful command needs no job',async()=>{
 const result=await runCommand(async()=>({ok:true,exitCode:0,stdout:''}),'true',opts);
 assert.equal(result.exitCode,0);assert.equal(result.stdout,'');
});
test('inline failure preserves exit and stderr',async()=>{
 const result=await runCommand(async()=>({ok:true,exitCode:7,stdout:'',stderr:'failed'}),'false',opts);
 assert.equal(result.exitCode,7);assert.equal(result.stderr,'failed');
});
test('Awtsmoos observes full receipt identity without redispatch',async()=>{
 const calls=[], receipt={controlRequestId:'c1',requestedAction:'commandRun',clientRequestId:'client',nonce:'nonce',projectRoot:'/owned',agentSessionId:'session'};
 const result=await runCommand(async p=>{calls.push(p);return calls.length===1?
  {pending:true,observeWith:receipt}:{ok:true,exitCode:0,stdout:'witness'};},'echo witness',opts);
 assert.equal(result.stdout,'witness');assert.equal(calls.length,2);
 assert.deepEqual(calls[1],{...receipt,action:'retryAction',logicalAgentId:opts.logicalAgentId});
});
test('running output never becomes premature success; terminal pages assemble',async()=>{
 const calls=[];let waits=0;
 const result=await runCommand(async p=>{
  calls.push(p);
  if(p.action==='commandRun')return {jobId:'j1',status:'running'};
  if(p.action==='commandWait')return ++waits===1?{jobId:'j1',done:false,stdout:'early'}:{jobId:'j1',done:true,status:'failed',exitCode:9};
  if(p.stream==='stderr')return {jobId:'j1',content:'late error',hasNextPage:false};
  return p.offsetChars===0?{jobId:'j1',content:'first',hasNextPage:true,nextOffsetChars:5}:
   {jobId:'j1',content:'last',hasNextPage:false};
 },'command',opts);
 assert.equal(waits,2);assert.equal(result.stdout,'firstlast');assert.equal(result.stderr,'late error');assert.equal(result.exitCode,9);
 assert.equal(calls.filter(p=>p.action==='commandRun').length,1);
});
test('wait receipt is observed rather than issuing another wait',async()=>{
 let step=0;const calls=[];
 await runCommand(async p=>{calls.push(p);step++;
  return [{jobId:'j1'},{pending:true,retryPayload:{controlRequestId:'wait1',requestedAction:'commandWait',jobId:'j1'}},
   {jobId:'j1',done:true,exitCode:0},{content:'',hasNextPage:false},{content:'',hasNextPage:false}][step-1];
 },'command',opts);
 assert.equal(calls[2].action,'retryAction');assert.equal(calls[2].requestedAction,'commandWait');
});
test('correlation failure never redispatches mutation or consumes foreign result',async()=>{
 let count=0;
 await assert.rejects(runCommand(async()=>{count++;return {ok:false,error:'tunnel_response_correlation_mismatch',rawMismatchedResponse:{exitCode:0,stdout:'foreign'}};},'command',opts),/correlation_mismatch/);
 assert.equal(count,1);
});
test('partial receipt output fails explicitly',async()=>{
 await assert.rejects(runCommand(async p=>p.action==='commandRun'?{jobId:'j1',done:true,exitCode:0}:
  {content:'tail',outputPartial:true},'command',opts),/output_partial/);
});
test('nonadvancing pages cannot spin',async()=>{
 await assert.rejects(runCommand(async p=>p.action==='commandRun'?{jobId:'j1',done:true,exitCode:0}:
  {content:'x',hasNextPage:true,nextOffsetChars:0},'command',opts),/cursor/);
});
test('transport requires HTTPS and bearer for remote Awtsmoos',()=>{
 assert.throws(()=>httpApi('http://awtsmoos.com/api/tunnel/control/fs/example','token'),/https_required/);
 assert.throws(()=>httpApi('https://awtsmoos.com/api/tunnel/control/fs/example'),/TOKEN_required/);
});
test('expired pending-named receipt fails without observation loop',async()=>{
 let count=0;
 await assert.rejects(runCommand(async()=>{count++;return {action:'tunnelRequestPending',pending:false,terminal:true,ok:false,error:'tunnel_request_expired'};},'command',opts),/expired/);
 assert.equal(count,1);
});
