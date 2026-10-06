// B"H
// Boruch Hashem
// Blessed is He
const crypto=require("node:crypto");
const Store=require("./store.js");
const Repo=require("./repository.js");
const Gate=require("./gate.js");
const {invokeInstruction}=require("../actionGroups/instructionActions.js");
const {safePath}=require("../pathGuard.js");
const path=require("node:path"),fs=require("node:fs");
function scopedPaths(config,values){return strings(values).map(p=>path.relative(fs.realpathSync(config.root),safePath(config,p)).split(path.sep).join("/"));}
function strings(value,max=64){
 if(!Array.isArray(value)||value.length>max||value.some(x=>typeof x!=="string"||x.length>4000))throw Error("bounded_string_array_required");
 return value;
}
async function instructionReceipt(ws,payload){
 const resolved=await invokeInstruction(ws,"resolve",payload);
 const bodies=await invokeInstruction(ws,"get",{instructionIds:resolved.requiredInstructionIds||[]});
 const receipt={ready:resolved.serverAvailable===true&&bodies.serverAvailable===true&&bodies.ok!==false,
  generation:resolved.serverInstructionGeneration||"",hash:Store.digest(bodies.instructions||[]),
  ids:resolved.requiredInstructionIds||[],acknowledged:false,fetchedAt:new Date().toISOString()};
 return {receipt,instructions:bodies.instructions||[]};
}
function writable(config){if(config.allowWrite!==true)throw Error("write_disabled");}
/** The Awtsmoos resumes exact durable work; a checkpoint never launches arbitrary code. */
function buildWorkSessionActions({config,payload={},ws}){
 const id=payload.workId;
 const actions={
  async tunnelConnectionDiagnostics(){return require("../../../lib/runtime/connection-flight-recorder.js").current().report(payload.limit);},
  async tunnelWorkBegin(){
   writable(config);const task=String(payload.task||"").slice(0,8000);if(!task)throw Error("work_task_required");
   const paths=scopedPaths(config,payload.paths||[]);
   const urls=strings(payload.urls||[],16);for(const u of urls)if(!/^https?:\/\//.test(u))throw Error("work_url_invalid");
   const repo=await Repo.snapshot(config.root), fetched=await instructionReceipt(ws,{task,paths,mode:"write"});
   const session={id:"work_"+crypto.randomUUID(),revision:1,task,paths,urls,frontend:payload.frontend===true,
    commit:repo.commit,planId:String(payload.planId||"").slice(0,160),missionId:String(payload.missionId||"").slice(0,160),status:fetched.receipt.ready?"active":"blocked",instructions:fetched.receipt,
    completed:[],remainingWork:strings(payload.remainingWork||[]),nextAction:String(payload.nextAction||"").slice(0,4000),
    failures:[],retryBudget:Math.max(1,Math.min(10,Math.floor(Number(payload.retryBudget)||3))),failedAttempts:0,reportIds:[],reviews:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
   await Store.create(config,session);return {ok:true,session,instructions:fetched.instructions,repository:repo};
  },
  async tunnelWorkFailure(){
   writable(config);const reason=String(payload.failureReason||"").slice(0,1000);if(!reason)throw Error("work_failure_reason_required");
   const session=await Store.update(config,id,payload.revision,s=>{s.failedAttempts=(s.failedAttempts||0)+1;s.failures=[...s.failures,reason].slice(-64);if(s.failedAttempts>=(s.retryBudget||3)){s.status="blocked";s.nextAction="inspect_failure_and_refresh_before_retry";}return s;});return {ok:true,session,retryBudgetExhausted:session.status==="blocked",automaticRetry:false};
  },
  async tunnelWorkHealth(){
   const relay=require("../../../lib/local-api-readiness.js").current(),repository=await Repo.snapshot(config.root);
   return {ok:true,checkedAt:new Date().toISOString(),repository,checks:{process:{state:relay.parentAlive?"passed":"failed"},registeredRelay:{...relay,state:relay.relayReady?"passed":"failed"},commandExecution:{state:"unverified"},fileIntegrity:{state:"unverified"},authenticatedClient:{state:"unverified"},renderedFrontend:{state:"unverified"}},guidance:"Run owned command/file probes and authenticated-client and real frontend checks separately; process liveness is not execution proof."};
  },
  async tunnelWorkGet(){return {ok:true,session:await Store.get(config,id)};},
  async tunnelWorkCheckpoint(){
   writable(config);
   const session=await Store.update(config,id,payload.revision,s=>{
    for(const k of ["completed","remainingWork","failures","reportIds"])if(payload[k]!==undefined)s[k]=strings(payload[k]);
    if(payload.nextAction!==undefined)s.nextAction=String(payload.nextAction).slice(0,4000);
    if(payload.status!==undefined){if(!["active","blocked","complete"].includes(payload.status))throw Error("work_status_invalid");s.status=payload.status;}
    if(payload.instructionHash!==undefined){if(payload.instructionHash!==s.instructions.hash)throw Error("instruction_hash_changed");s.instructions.acknowledged=true;}
    return s;
   });return {ok:true,session};
  },
  async tunnelWorkRefresh(){
   writable(config);const s=await Store.get(config,id), repo=await Repo.snapshot(config.root);
   const task=payload.task===undefined?s.task:String(payload.task).slice(0,8000);
   const paths=payload.paths===undefined?s.paths:scopedPaths(config,payload.paths);
   const urls=payload.urls===undefined?s.urls:strings(payload.urls,16);for(const u of urls)if(!/^https?:\/\//.test(u))throw Error("work_url_invalid");
   const fetched=await instructionReceipt(ws,{task,paths,mode:"write"});
   const session=await Store.update(config,id,payload.revision,current=>({...current,task,paths,urls,frontend:payload.frontend===undefined?current.frontend:payload.frontend===true,commit:repo.commit,instructions:fetched.receipt,
    reportIds:[],reviews:{},status:fetched.receipt.ready?"active":"blocked"}));
   return {ok:true,session,instructions:fetched.instructions,repository:repo};
  },
  async tunnelWorkReview(){
   writable(config);const report=await Store.get(config,payload.reportId,"reports");
   const hashes=strings(payload.reviewedScreenshotHashes||[],4);
   const expected=report.samples.map(s=>s.screenshotSha256);
   if(!expected.length||hashes.length!==expected.length||hashes.some((h,i)=>h!==expected[i]))throw Error("screenshot_review_hash_mismatch");
   const notes=String(payload.reviewNotes||"").trim();if(notes.length<20||notes.length>8000)throw Error("screenshot_review_notes_required");
   const session=await Store.update(config,id,payload.revision,s=>{
    if(report.commit!==s.commit||!s.reportIds.includes(report.id))throw Error("review_report_not_bound");
    s.reviews||={};s.reviews[report.id]={hashes,notes,source:"caller_visual_review_acknowledgement",reviewedAt:new Date().toISOString()};return s;
   });return {ok:true,session};
  },
  async tunnelWorkResume(){

   const session=await Store.get(config,id),repo=await Repo.snapshot(config.root);
   const current=await instructionReceipt(ws,{task:session.task,paths:session.paths,mode:"write"});
   const refreshRequired=repo.commit!==session.commit||!current.receipt.ready||current.receipt.hash!==session.instructions.hash||current.receipt.generation!==session.instructions.generation;
   return {ok:true,session,repository:repo,refreshRequired,
    instructionRefreshRecommended:true,nextSafeAction:!repo.clean?"review_uncommitted_changes":refreshRequired?"refresh_instructions_and_repository":session.nextAction,
    automaticExecution:false};
  },
  async tunnelWorkReleaseReceipt(){
   const gate=await actions.tunnelWorkGate();if(!gate.ok)return {...gate,error:"release_gate_blocked"};
   const session=await Store.get(config,id),reports=await Promise.all(session.reportIds.map(r=>Store.get(config,r,"reports")));
   return {ok:true,source:"awtsmoos-work-gate",testedCommit:gate.commit,generatedAt:new Date().toISOString(),session,reports};
  },
  async tunnelWorkGate(){
   const session=await Store.get(config,id),repo=await Repo.snapshot(config.root);
   const reports=await Promise.all(session.reportIds.map(r=>Store.get(config,r,"reports")));
   const current=await instructionReceipt(ws,{task:session.task,paths:session.paths,mode:"write"});
   const result=Gate.evaluate(session,repo,reports);
   if(!current.receipt.ready||current.receipt.hash!==session.instructions.hash||current.receipt.generation!==session.instructions.generation){result.ok=false;result.releaseReady=false;result.reasons.push("instructions_changed_or_unavailable");}
   return {...result,workId:id};
  }
 };
 return actions;
}
module.exports={buildWorkSessionActions,instructionReceipt};
