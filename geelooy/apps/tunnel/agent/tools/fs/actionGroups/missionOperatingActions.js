// B"H
const M = require('../mission/index.js');
const Room = require('../mission/roomState.js');
const Guidance = require('../mission/guidance/index.js');
function mid(p){return p.missionId||p.id||p.target||'';}
async function use(config,payload,fn){const m=await M.load(config,mid(payload));if(!m)return {ok:false,action:payload.action,error:'mission_not_found',missionId:mid(payload)};const out=await fn(m);await M.save(config,m);return out;}
function report(m){return M.missionOsStatus(m);}
function guide(action,out,m){return {...out,...Guidance.render(action,out,m)};}
function withPrompt(action,out,m){const prompt=M.missionOsPrompt(m,{steer:true});return guide(action,{...out, missionInstruction:prompt.instruction, prompt},m);}
function schedulerEnvelope(m,payload){
  const room = Room.live(m,payload);
  return { room, scheduler: room.scheduler, nextHighestWork: room.nextHighestWork,
    missionGraph: room.missionGraph, health: room.health };
}
function buildMissionOperatingActions(ctx){const {config}=ctx,payload=ctx.payload||{};return {
  async missionOsSeed(){return use(config,payload,m=>withPrompt('missionOsSeed',{ok:true,action:'missionOsSeed',missionId:m.id,missionOs:M.missionOsSeed(m,payload),next:{action:'missionOsKeepGoing',missionId:m.id}},m));},
  async missionOsStatus(){return use(config,payload,m=>withPrompt('missionOsStatus',{ok:true,action:'missionOsStatus',missionId:m.id,missionOs:report(m)},m));},
  async missionOsPrompt(){return use(config,payload,m=>guide('missionOsPrompt',{ok:true,action:'missionOsPrompt',missionId:m.id,prompt:M.missionOsPrompt(m,{...payload,steer:true})},m));},
  async missionOsKeepGoing(){return use(config,payload,m=>withPrompt('missionOsKeepGoing',{ok:true,action:'missionOsKeepGoing',missionId:m.id,continuation:M.missionOsKeepGoing(m,payload),missionOs:report(m)},m));},
  async missionOsSteer(){return use(config,payload,m=>withPrompt('missionOsSteer',{ok:true,action:'missionOsSteer',missionId:m.id,steering:M.missionOsSteer(m,payload),missionOs:report(m)},m));},
  async missionOsAddNode(){return use(config,payload,m=>withPrompt('missionOsAddNode',{ok:true,action:'missionOsAddNode',node:M.missionOsAddNode(m,payload),missionOs:report(m)},m));},
  async missionOsUpdateNode(){return use(config,payload,m=>withPrompt('missionOsUpdateNode',{ok:true,action:'missionOsUpdateNode',node:M.missionOsUpdateNode(m,payload),missionOs:report(m)},m));},
  async missionOsReceipt(){return use(config,payload,m=>withPrompt('missionOsReceipt',{ok:true,action:'missionOsReceipt',receipt:M.missionOsReceipt(m,payload),missionOs:report(m)},m));},
  async missionOsNext(){return use(config,payload,m=>withPrompt('missionOsNext',{ok:true,action:'missionOsNext',activeNode:M.missionOsNext(m),missionOs:report(m)},m));},
  async missionOsReleaseCourt(){return use(config,payload,m=>withPrompt('missionOsReleaseCourt',{ok:true,action:'missionOsReleaseCourt',court:M.missionOsReleaseCourt(m),missionOs:report(m)},m));},
  async missionOsCycleCheck(){return use(config,payload,m=>withPrompt('missionOsCycleCheck',{ok:true,action:'missionOsCycleCheck',cycle:M.missionOsCycleCheck(m,payload),missionOs:report(m)},m));},
  async missionOsConstitution(){return use(config,payload,m=>withPrompt('missionOsConstitution',{ok:true,action:'missionOsConstitution',constitution:M.missionOsConstitution(m),missionOs:report(m)},m));},
  async missionRoomLiveStatus(){return use(config,payload,m=>withPrompt('missionRoomLiveStatus',{ok:true,action:'missionRoomLiveStatus',missionId:m.id,...schedulerEnvelope(m,payload),missionOs:report(m)},m));},
  async missionRoomSchedulerStatus(){return use(config,payload,m=>withPrompt('missionRoomSchedulerStatus',{ok:true,action:'missionRoomSchedulerStatus',missionId:m.id,...schedulerEnvelope(m,payload),finalAnswerAllowed:false,mustContinue:true},m));}
};}
/** B"H — Mission responses now carry facts plus generated plain English. */
module.exports={buildMissionOperatingActions};
