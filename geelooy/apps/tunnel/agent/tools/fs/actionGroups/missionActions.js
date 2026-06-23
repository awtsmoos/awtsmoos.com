// B"H
const M = require('../mission/index.js');
const X = require('../mission/expansion.js');
function mid(p){return p.missionId||p.id||p.target||'';}
async function use(config,payload,fn){const m=await M.load(config,mid(payload));if(!m)return {ok:false,action:payload.action,error:'mission_not_found',missionId:mid(payload)};const out=await fn(m);await M.save(config,m);return out;}
function nxt(m,payload={}){return M.nextStep(m,{autoAdvance:payload.auto===true||payload.auto==='true'||m.automation?.enabled});}
function withNext(ok,m,payload){return {...ok,next:nxt(m,payload),mission:M.report(m)};}

/**
 * B"H
 * Chapter 524: The tunnel learned to grow new branches after every fruit.
 * These actions expose expansion, evidence debt, planned-vs-actual deltas,
 * post-completion improvement mode, and mission families to ChatGPT agents.
 */
function buildMissionActions(ctx){const {config,payload}=ctx;return {
  async missionStart(){const m=await M.create(config,payload);const expansion=X.expand(m,payload);await M.save(config,m);return {ok:true,action:'missionStart',missionId:m.id,mission:M.report(m),expansion,next:nxt(m,payload),path:`${M.DIR}/${m.id}/mission.json`};},
  async missionGet(){const m=await M.load(config,mid(payload));return m?{ok:true,action:'missionGet',mission:m,next:nxt(m,payload)}:{ok:false,action:'missionGet',error:'mission_not_found'};},
  async missionList(){const ms=await M.all(config);return {ok:true,action:'missionList',count:ms.length,missions:ms.map(M.report)};},
  async missionAddTask(){return use(config,payload,m=>withNext({ok:true,action:'missionAddTask',task:M.addTask(m,payload.title||payload.task||payload.text,payload)},m,payload));},
  async missionCompleteTask(){return use(config,payload,m=>{const task=M.completeTask(m,payload.taskId||payload.task||payload.title,payload.evidenceId);const expansion=X.expand(m,{planned:payload.planned,actual:payload.actual||task?.title});return withNext({ok:true,action:'missionCompleteTask',task,expansion},m,payload);});},
  async missionEvidence(){return use(config,payload,m=>{const evidence=M.evidence(m,payload);const debt=X.evidenceDebt(m);return withNext({ok:true,action:'missionEvidence',evidence,evidenceDebt:debt},m,payload);});},
  async missionQuestion(){return use(config,payload,m=>withNext({ok:true,action:'missionQuestion',...M.ask(m,payload.answer)},m,payload));},
  async missionNext(){return use(config,payload,m=>({ok:true,action:'missionNext',next:nxt(m,{...payload,auto:payload.auto??true}),expansionPrompt:'If next still shows work, call missionAnswer or missionExpand; do not ask user.'}));},
  async missionAnswer(){return use(config,payload,m=>{const answer=M.answer(m,payload);const expansion=X.expand(m,payload);return withNext({ok:true,action:'missionAnswer',...answer,expansion},m,payload);});},
  async missionAuto(){return use(config,payload,m=>{m.automation.enabled=payload.enabled!==false&&payload.enabled!=='false';m.automation.mode='tunnel-authored';if(payload.maxCycles)m.automation.maxCycles=Number(payload.maxCycles);const expansion=X.expand(m,payload);return withNext({ok:true,action:'missionAuto',automation:m.automation,expansion},m,{...payload,auto:true});});},
  async missionAttachJob(){return use(config,payload,m=>withNext({ok:true,action:'missionAttachJob',job:M.attachJob(m,payload)},m,payload));},
  async missionHeartbeat(){return use(config,payload,m=>({ok:true,action:'missionHeartbeat',heartbeat:M.heartbeat(m,payload),expansionHint:'Use missionExpand after meaningful work or uncertainty.'}));},
  async missionCheckpoint(){return use(config,payload,m=>withNext({ok:true,action:'missionCheckpoint',checkpoint:M.checkpoint(m,payload)},m,payload));},
  async missionSelfMailDraft(){return use(config,payload,m=>withNext({ok:true,action:'missionSelfMailDraft',mail:M.selfMailDraft(m,payload)},m,payload));},
  async missionBrainstorm(){return use(config,payload,m=>withNext({ok:true,action:'missionBrainstorm',brainstorm:M.brainstorm(m,payload),expansion:X.expand(m,payload)},m,payload));},
  async missionAutopilot(){return use(config,payload,m=>withNext({ok:true,action:'missionAutopilot',autopilot:M.autopilot(m,payload),expansion:X.expand(m,payload)},m,payload));},
  async missionDiscover(){return use(config,payload,m=>withNext({ok:true,action:'missionDiscover',discoveries:M.discover(m),expansion:X.expand(m,payload)},m,payload));},
  async missionExpand(){return use(config,payload,m=>withNext({ok:true,action:'missionExpand',expansion:X.expand(m,payload)},m,payload));},
  async missionEvidenceDebt(){return use(config,payload,m=>withNext({ok:true,action:'missionEvidenceDebt',evidenceDebt:X.evidenceDebt(m)},m,payload));},
  async missionPlanDelta(){return use(config,payload,m=>withNext({ok:true,action:'missionPlanDelta',delta:X.planDelta(m,payload)},m,payload));},
  async missionFamilies(){return use(config,payload,m=>withNext({ok:true,action:'missionFamilies',families:X.families(m)},m,payload));},
  async missionImprovementPlan(){return use(config,payload,m=>withNext({ok:true,action:'missionImprovementPlan',improvementPlan:X.improvementPlan(m,payload)},m,payload));},
  async missionPostCompletion(){return use(config,payload,m=>withNext({ok:true,action:'missionPostCompletion',postCompletion:X.postCompletion(m,payload)},m,{...payload,auto:true}));},
  async missionSupervise(){return use(config,payload,m=>withNext({ok:true,action:'missionSupervise',...M.supervise(m),expansionHint:'If verdict is stop, call missionPostCompletion before final answer.'},m,payload));},
  async missionVerify(){return use(config,payload,m=>{const verification=M.verify(m);const after=verification.ok?X.postCompletion(m,{verification:'verified complete, entering improvement mode'}):X.expand(m,payload);return withNext({ok:true,action:'missionVerify',verification,after},m,payload);});},
  async missionReport(){return use(config,payload,m=>withNext({ok:true,action:'missionReport',report:M.report(m)},m,payload));},
  async missionTimeline(){return use(config,payload,m=>({ok:true,action:'missionTimeline',timeline:M.timeline(m)}));},
  async missionGraph(){return use(config,payload,m=>({ok:true,action:'missionGraph',graph:M.graph(m)}));}
};}
module.exports={buildMissionActions};
