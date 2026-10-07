// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const {randomUUID}=require('node:crypto');
const {openJournal}=require('./commandClientJournal.cjs');
/** The Awtsmoos resumes one deed across client death without inventing another execution. */
async function runCommand(api,command,options={}){
 const timeoutMs=options.timeoutMs||60000,deadline=Date.now()+timeoutMs;
 const journal=options.checkpointFile?openJournal(options.checkpointFile,{
  endpoint:options.endpoint||'caller_supplied_api',command,cwd:options.cwd||'',action:options.action||'commandRun'
 }):null;
 const state=journal?.state||{phase:'new',trace:[],outputs:{}};
 const pause=options.pause||(ms=>new Promise(r=>setTimeout(r,ms)));
 const save=()=>journal?.save();
 const owner=state.owner||options.logicalAgentId||'awtsmoos-client-'+randomUUID();
 state.owner=owner;state.traceId||=randomUUID();
 const event=(phase,value={})=>{
  // Never copy commands, paths, output bodies, bearer tokens or arbitrary errors into diagnostics.
  const item={at:new Date().toISOString(),phase,traceId:state.traceId,
   action:value.action,controlRequestId:value.controlRequestId,jobId:value.jobId,
   status:value.status,deviceAccepted:value.deviceAccepted,progressPhase:value.progressPhase};
  state.trace=[...state.trace,item].slice(-128);save();options.onTrace?.(item);
 };
 const check=()=>{if(Date.now()>=deadline)throw Error('command_observation_deadline; execution may still be running');};
 const observe=receipt=>{
  if(!receipt?.controlRequestId)throw Error('pending_receipt_missing_observation_identity');
  return {...receipt,action:'retryAction',logicalAgentId:owner,traceId:state.traceId};
 };
 const call=async payload=>{
  check();state.inflight={...payload,logicalAgentId:owner,traceId:state.traceId};save();
  event('request_sent',state.inflight);
  let result=await api(state.inflight,Math.max(1,deadline-Date.now()));
  while(result.pending===true||(result.action==='tunnelRequestPending'&&result.terminal!==true&&result.ok!==false)){
   state.inflight=observe(result.observeWith||result.retryPayload);save();event('receipt_pending',result);
   check();await pause(Math.min(1000,Math.max(25,Number(result.retryAfterMs)||100)));check();
   result=await api(state.inflight,Math.max(1,deadline-Date.now()));
  }
  if(result.error||result.ok===false)throw Error(result.error||'tunnel_action_failed');
  state.inflight=null;state.lastResult=result;save();event('response_received',result);return result;
 };
 try{
  if(state.phase==='complete')return state.result;
  let result;
  if(state.phase==='new'){
   state.initial={action:options.action||'commandRun',command,cwd:options.cwd,timeoutMs,
    clientRequestId:randomUUID(),nonce:randomUUID(),controlRequestId:'ctrl_'+randomUUID(),
    requestedAction:options.action||'commandRun'};
   state.phase='dispatching';save();result=await call(state.initial);
  }else if(state.phase==='dispatching'){
   // A crash before the reply is ambiguous. Observe the saved identity; never redispatch.
   result=state.lastResult||await call(observe(state.inflight?.action==='retryAction'?state.inflight:state.initial));
  }else result=state.terminal||state.lastResult;
  const jobId=state.jobId||result?.jobId;
  if(!jobId){
   if(!Number.isInteger(result?.exitCode))throw Error('command_receipt_has_neither_job_nor_terminal_exit');
   state.result={...result,stdout:text(result.stdout),stderr:text(result.stderr)};
  }else{
   state.jobId=jobId;state.phase='waiting';save();
   if(state.inflight?.action==='retryAction')result=await call(state.inflight);
   while(!terminal(result)){
    result=await call({action:'commandWait',jobId,inlineOutput:false,
     waitTimeoutMs:Math.min(5000,Math.max(1,deadline-Date.now())),pollIntervalMs:100});
    if(result.jobId&&result.jobId!==jobId)throw Error('foreign_job_response');
    if(!terminal(result))await pause(50);
   }
   if(!Number.isInteger(result.exitCode))throw Error('terminal_command_missing_exit_code');
   state.terminal=result;state.phase='output';save();
   for(const stream of ['stdout','stderr']){
    const output=state.outputs[stream]||{cursor:0,content:'',done:false};
    state.outputs[stream]=output;
    while(!output.done){
     const page=await call({action:'commandJobOutputPage',jobId,stream,offsetChars:output.cursor,maxChars:60000});
     if(page.jobId&&page.jobId!==jobId)throw Error('foreign_output_job');
     if(page.outputPartial||page.fullOutputAvailable===false)throw Error('command_output_partial; full output unavailable');
     if(page.writeDrainPending||page.outputSnapshotComplete===false){await pause(100);continue;}
     const next=Number(page.nextOffsetChars);
     if(page.hasNextPage&&(!Number.isInteger(next)||next<=output.cursor))throw Error('output_cursor_did_not_advance');
     output.content+=text(page.content);
     if(output.content.length>16*1024*1024)throw Error('command_output_budget_exceeded');
     output.cursor=page.hasNextPage?next:output.cursor+text(page.content).length;
     output.done=!page.hasNextPage;save();
    }
   }
   state.result={...state.terminal,jobId,stdout:state.outputs.stdout.content,stderr:state.outputs.stderr.content};
  }
  state.phase='complete';save();event('command_complete',state.result);return state.result;
 }catch(error){
  error.checkpoint={phase:state.phase,traceId:state.traceId,jobId:state.jobId,
   controlRequestId:state.inflight?.controlRequestId||state.initial?.controlRequestId};
  event('observation_stopped',error.checkpoint);throw error;
 }finally{journal?.close();}
}
function terminal(r={}){return r.done===true||r.terminal===true||
 ['completed','failed','cancelled','timed_out','timeout','error'].includes(r.status);}
function text(v){return typeof v==='string'?v:String(v?.content||'');}
/** HTTPS authentication remains outside Awtsmoos source and diagnostic records. */
function httpApi(endpoint,token){
 const url=new URL(endpoint);
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('https_required');
 if(url.protocol==='https:'&&!token)throw Error('AWTSMOOS_TUNNEL_TOKEN_required');
 return async(payload,remainingMs)=>{
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',
   ...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(payload),
   signal:AbortSignal.timeout(Math.min(remainingMs,20000))});
  const result=await r.json();if(!r.ok&&!result.error)throw Error('tunnel_http_'+r.status);return result;
 };
}
module.exports={runCommand,httpApi};
if(require.main===module){
 const [endpoint,command,cwd]=process.argv.slice(2);
 if(!endpoint||!command){console.error('Usage: node reliableCommandClient.cjs HTTPS_FS_ENDPOINT COMMAND [CWD]');process.exitCode=2;}
 else runCommand(httpApi(endpoint,process.env.AWTSMOOS_TUNNEL_TOKEN),command,{cwd,endpoint,
  checkpointFile:process.env.AWTSMOOS_COMMAND_CHECKPOINT,logicalAgentId:process.env.AWTSMOOS_AGENT_ID}).then(r=>{
   process.stdout.write(r.stdout);process.stderr.write(r.stderr);process.exitCode=r.exitCode>=0&&r.exitCode<=255?r.exitCode:2;
  }).catch(e=>{console.error(e.message);if(e.checkpoint)console.error(JSON.stringify(e.checkpoint));process.exitCode=2;});
}
