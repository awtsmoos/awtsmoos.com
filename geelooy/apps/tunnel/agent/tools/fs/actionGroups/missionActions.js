// B"H
const M = require('../mission/index.js');
function mid(p){return p.missionId||p.id||p.target||'';}
async function use(config,payload,fn){const m=await M.load(config,mid(payload));if(!m)return {ok:false,action:payload.action,error:'mission_not_found',missionId:mid(payload)};const out=await fn(m);await M.save(config,m);return out;}

/**
 * B"H
 * Chapter 523: The local tunnel spoke back at every street.
 * These actions let ChatGPT answer a multiple-choice vessel, or hand the pen
 * back to the tunnel so the next question is generated forever until done.
 */
function buildMissionActions(ctx){const {config,payload}=ctx;return {
  async missionStart(){const m=await M.create(config,payload);const next=M.nextStep(m,{autoAdvance:m.automation.enabled});await M.save(config,m);return {ok:true,action:'missionStart',missionId:m.id,mission:M.report(m),next,path:`${M.DIR}/${m.id}/mission.json`};},
  async missionGet(){const m=await M.load(config,mid(payload));return m?{ok:true,action:'missionGet',mission:m,next:M.nextStep(m,{autoAdvance:m.automation?.enabled})}:{ok:false,action:'missionGet',error:'mission_not_found'};},
  async missionList(){const ms=await M.all(config);return {ok:true,action:'missionList',count:ms.length,missions:ms.map(M.report)};},
  async missionAddTask(){return use(config,payload,m=>({ok:true,action:'missionAddTask',task:M.addTask(m,payload.title||payload.task||payload.text,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionCompleteTask(){return use(config,payload,m=>({ok:true,action:'missionCompleteTask',task:M.completeTask(m,payload.taskId||payload.task||payload.title,payload.evidenceId),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionEvidence(){return use(config,payload,m=>({ok:true,action:'missionEvidence',evidence:M.evidence(m,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionQuestion(){return use(config,payload,m=>({ok:true,action:'missionQuestion',...M.ask(m,payload.answer),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionNext(){return use(config,payload,m=>({ok:true,action:'missionNext',next:M.nextStep(m,{autoAdvance:payload.auto === true || payload.auto === 'true' || m.automation.enabled})}));},
  async missionAnswer(){return use(config,payload,m=>({ok:true,action:'missionAnswer',...M.answer(m,payload)}));},
  async missionAuto(){return use(config,payload,m=>{m.automation.enabled=payload.enabled !== false && payload.enabled !== 'false';m.automation.mode='tunnel-authored';if(payload.maxCycles)m.automation.maxCycles=Number(payload.maxCycles);const next=M.nextStep(m,{autoAdvance:true});return {ok:true,action:'missionAuto',automation:m.automation,next};});},
  async missionAttachJob(){return use(config,payload,m=>({ok:true,action:'missionAttachJob',job:M.attachJob(m,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionHeartbeat(){return use(config,payload,m=>({ok:true,action:'missionHeartbeat',heartbeat:M.heartbeat(m,payload)}));},
  async missionCheckpoint(){return use(config,payload,m=>({ok:true,action:'missionCheckpoint',checkpoint:M.checkpoint(m,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionSelfMailDraft(){return use(config,payload,m=>({ok:true,action:'missionSelfMailDraft',mail:M.selfMailDraft(m,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionBrainstorm(){return use(config,payload,m=>({ok:true,action:'missionBrainstorm',brainstorm:M.brainstorm(m,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionAutopilot(){return use(config,payload,m=>({ok:true,action:'missionAutopilot',autopilot:M.autopilot(m,payload),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionDiscover(){return use(config,payload,m=>({ok:true,action:'missionDiscover',discoveries:M.discover(m),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionSupervise(){return use(config,payload,m=>({ok:true,action:'missionSupervise',...M.supervise(m),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionVerify(){return use(config,payload,m=>({ok:true,action:'missionVerify',verification:M.verify(m),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionReport(){return use(config,payload,m=>({ok:true,action:'missionReport',report:M.report(m),next:M.nextStep(m,{autoAdvance:m.automation.enabled})}));},
  async missionTimeline(){return use(config,payload,m=>({ok:true,action:'missionTimeline',timeline:M.timeline(m)}));},
  async missionGraph(){return use(config,payload,m=>({ok:true,action:'missionGraph',graph:M.graph(m)}));}
};}
module.exports={buildMissionActions};
