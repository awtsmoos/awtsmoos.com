// B"H
const M = require('../mission/index.js');
const X = require('../mission/expansion.js');
const S = require('../mission/stepProtocol.js');
const L = require('../mission/loopEngine.js');
const C = require('../mission/collaboration.js');
const MISSION_LOCKS = new Map();
function parsedParams(params){if(!params)return {};if(typeof params==='object'&&!Array.isArray(params))return params;if(typeof params==='string'){try{const parsed=JSON.parse(params);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch{return {};}}return {};}
function mergedPayload(payload={}){const decoded=parsedParams(payload.params);return {...decoded,...payload};}
function mid(p){return p.missionId||p.id||p.target||'';}
async function use(config,payload,fn){const missionId=mid(payload);return withMissionLock(config,missionId,async()=>{const m=await M.load(config,missionId);if(!m)return {ok:false,action:payload.action,error:'mission_not_found',missionId};const out=await fn(m);await M.save(config,m);return out;});}
async function withMissionLock(config, missionId, fn){const key=`${config.root||process.cwd()}::${missionId||'none'}`;const previous=MISSION_LOCKS.get(key)||Promise.resolve();let release;const current=new Promise(resolve=>{release=resolve;});MISSION_LOCKS.set(key,previous.then(()=>current,current));await previous.catch(()=>{});try{return await fn();}finally{release();if(MISSION_LOCKS.get(key)===current)MISSION_LOCKS.delete(key);}}
function nxt(m,payload={}){return M.nextStep(m,{autoAdvance:payload.auto===true||payload.auto==='true'||m.automation?.enabled});}
function withNext(ok,m,payload){return {...ok,next:ok.next||nxt(m,payload),mission:M.report(m)};}
function matchesProject(m,payload={}){const q=String(payload.q||payload.query||payload.projectRoot||payload.root||payload.directory||'').toLowerCase();if(!q)return true;const room=C.ensure(m);const meta=m.metadata||{};const candidates=[m.id,m.goal,room.projectRoot,meta.projectRoot,meta.root,meta.directory,meta.project].map(v=>String(v||'').toLowerCase()).filter(Boolean);return candidates.some(v=>v.includes(q)||q.includes(v));}

/**
 * B"H
 * Chapter 524: The tunnel learned to grow new branches after every fruit.
 * These actions expose expansion, evidence debt, planned-vs-actual deltas,
 * post-completion improvement mode, and mission families to ChatGPT agents.
 */
function buildMissionActions(ctx){const {config}=ctx;const payload=mergedPayload(ctx.payload||{});return {
  async missionStart(){const startPayload={...payload,metadata:{...(payload.metadata||{}),projectRoot:payload.projectRoot||payload.root||payload.directory||payload.metadata?.projectRoot||''}};const m=await M.create(config,startPayload);const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';const expansion=shouldExpand?X.expand(m,payload):null;await M.save(config,m);return {ok:true,action:'missionStart',missionId:m.id,mission:M.report(m),expansion,next:nxt(m,payload),path:`${M.DIR}/${m.id}/mission.json`};},
  async missionGet(){const m=await M.load(config,mid(payload));return m?{ok:true,action:'missionGet',mission:m,next:nxt(m,payload)}:{ok:false,action:'missionGet',error:'mission_not_found'};},
  async missionList(){const ms=await M.all(config);return {ok:true,action:'missionList',count:ms.length,missions:ms.map(M.report)};},
  async missionAddTask(){return use(config,payload,m=>withNext({ok:true,action:'missionAddTask',task:M.addTask(m,payload.title||payload.task||payload.text,payload)},m,payload));},
  async missionCompleteTask(){return use(config,payload,m=>{const task=M.completeTask(m,payload.taskId||payload.task||payload.title,payload.evidenceId);const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';const expansion=shouldExpand?X.expand(m,{planned:payload.planned,actual:payload.actual||task?.title}):null;return withNext({ok:true,action:'missionCompleteTask',task,expansion},m,payload);});},
  async missionEvidence(){return use(config,payload,m=>{const evidence=M.evidence(m,payload);const includeDebt=payload.includeEvidenceDebt===true||payload.includeEvidenceDebt==='true'||payload.expand===true||payload.expand==='true';const debt=includeDebt?X.evidenceDebt(m):[];return withNext({ok:true,action:'missionEvidence',evidence,evidenceDebt:debt},m,payload);});},
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
  async missionVerify(){return use(config,payload,m=>{const verification=M.verify(m);const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';const after=verification.ok?X.postCompletion(m,{verification:'verified complete, entering improvement mode'}):(shouldExpand?X.expand(m,payload):null);return withNext({ok:true,action:'missionVerify',verification,after},m,payload);});},
  async missionReport(){return use(config,payload,m=>withNext({ok:true,action:'missionReport',report:M.report(m)},m,payload));},
  async missionTimeline(){return use(config,payload,m=>({ok:true,action:'missionTimeline',timeline:M.timeline(m)}));},
  async missionGraph(){return use(config,payload,m=>({ok:true,action:'missionGraph',graph:M.graph(m)}));},
  async missionStepBrainstorm(){return use(config,payload,m=>withNext({ok:true,action:'missionStepBrainstorm',...S.brainstorm(m,payload)},m,payload));},
  async missionStepPlan(){return use(config,payload,m=>withNext({ok:true,action:'missionStepPlan',...S.stepPlan(m,payload)},m,payload));},
  async missionFilesToTouch(){return use(config,payload,m=>withNext({ok:true,action:'missionFilesToTouch',...S.filesToTouch(m,payload)},m,payload));},
  async missionChunkPlan(){return use(config,payload,m=>withNext({ok:true,action:'missionChunkPlan',...S.chunkPlan(m,payload)},m,payload));},
  async missionStepExecute(){return use(config,payload,m=>withNext({ok:true,action:'missionStepExecute',...S.execute(m,payload)},m,payload));},
  async missionStepReview(){return use(config,payload,m=>withNext({ok:true,action:'missionStepReview',...S.review(m,payload)},m,payload));},
  async missionStepDelta(){return use(config,payload,m=>withNext({ok:true,action:'missionStepDelta',...S.delta(m,payload)},m,payload));},
  async missionRefrigerate(){return use(config,payload,async m=>withNext({ok:true,action:'missionRefrigerate',...(await S.refrigerate(config,m,payload))},m,payload));},
  async missionThaw(){return use(config,payload,m=>withNext({ok:true,action:'missionThaw',...S.thaw(m,payload)},m,payload));},
  async missionNextPlan(){return use(config,payload,m=>withNext({ok:true,action:'missionNextPlan',...S.nextPlan(m,payload)},m,payload));},
  async missionLoopSeed(){return use(config,payload,m=>withNext({ok:true,action:'missionLoopSeed',...L.seed(m,payload)},m,payload));},
  async missionLoopPulse(){return use(config,payload,m=>withNext({ok:true,action:'missionLoopPulse',...L.pulse(m,payload)},m,payload));},
  async missionLoopQueue(){return use(config,payload,m=>withNext({ok:true,action:'missionLoopQueue',...L.queue(m,payload)},m,payload));},
  async missionLoopWatchdog(){return use(config,payload,m=>withNext({ok:true,action:'missionLoopWatchdog',watchdog:L.watchdog(m,payload),...L.pulse(m,{...payload,replenishFamilies:4})},m,payload));},
  async missionLoopCheckpoint(){return use(config,payload,m=>withNext({ok:true,action:'missionLoopCheckpoint',...L.checkpointLoop(m,payload)},m,payload));},
  async missionProjectDiscover(){const all=await M.all(config);const missions=all.filter(m=>matchesProject(m,payload)).slice(0,Number(payload.limit||20)).map(m=>({mission:M.report(m),collaboration:C.status(m),score:m.collaboration?2:1,updatedAt:m.updatedAt}));return {ok:true,action:'missionProjectDiscover',count:missions.length,missions,next:missions[0]?{action:'missionProjectJoin',missionId:missions[0].mission.id,projectRoot:payload.projectRoot||payload.root||payload.directory||'',agentId:payload.agentId||payload.logicalAgentId||'agent'}:{action:'missionStart',goal:payload.goal||payload.q||'New mission room',projectRoot:payload.projectRoot||payload.root||payload.directory||''},mustCallNext:missions[0]?{action:'missionProjectJoin',missionId:missions[0].mission.id,projectRoot:payload.projectRoot||payload.root||payload.directory||'',agentId:payload.agentId||payload.logicalAgentId||'agent'}:null,finalAnswerAllowed:false,mustContinue:true};},
  async missionProjectJoin(){return use(config,payload,m=>withNext({ok:true,action:'missionProjectJoin',...C.join(m,payload)},m,payload));},
  async missionProjectStatus(){return use(config,payload,m=>withNext({ok:true,action:'missionProjectStatus',collaboration:C.status(m)},m,payload));},
  async missionProjectInvite(){return use(config,payload,m=>withNext({ok:true,action:'missionProjectInvite',invitePrompt:C.inviteText(m,payload),collaboration:C.status(m)},m,payload));},
  async missionRoomUserMessage(){return use(config,payload,m=>withNext({ok:true,action:'missionRoomUserMessage',...C.userMessage(m,payload)},m,payload));},
  async missionRoomSettings(){return use(config,payload,m=>withNext({ok:true,action:'missionRoomSettings',...C.settings(m,payload)},m,payload));},
  async missionAgentSync(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentSync',...C.sync(m,payload)},m,payload));},
  async missionAgentMessage(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentMessage',...C.message(m,payload)},m,payload));},
  async missionAgentRespond(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentRespond',...C.respond(m,payload)},m,payload));},
  async missionAgentDelegate(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentDelegate',...C.delegate(m,payload)},m,payload));},
  async missionAgentClaim(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentClaim',...C.claim(m,payload)},m,payload));},
  async missionAgentHeartbeat(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentHeartbeat',...C.heartbeat(m,payload)},m,payload));},
  async missionAgentAudit(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentAudit',...C.audit(m,payload)},m,payload));},
  async missionAgentComplete(){return use(config,payload,m=>withNext({ok:true,action:'missionAgentComplete',...C.complete(m,payload)},m,payload));}
};} 
module.exports={buildMissionActions,mergedPayload};
