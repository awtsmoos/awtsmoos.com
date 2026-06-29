// B"H
const M = require('../mission/index.js');
function mid(p){return p.missionId||p.id||p.target||'';}
async function use(config,payload,fn){const m=await M.load(config,mid(payload));if(!m)return {ok:false,action:payload.action,error:'mission_not_found',missionId:mid(payload)};const out=await fn(m);await M.save(config,m);return out;}
function report(m){return M.missionOsStatus(m);}
function withPrompt(out,m){const prompt=M.missionOsPrompt(m,{steer:true});return {...out, missionInstruction:prompt.instruction, prompt};}
function buildMissionOperatingActions(ctx){const {config}=ctx,payload=ctx.payload||{};return {
  async missionOsSeed(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsSeed',missionId:m.id,missionOs:M.missionOsSeed(m,payload),next:{action:'missionOsKeepGoing',missionId:m.id}},m));},
  async missionOsStatus(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsStatus',missionId:m.id,missionOs:report(m)},m));},
  async missionOsPrompt(){return use(config,payload,m=>({ok:true,action:'missionOsPrompt',missionId:m.id,prompt:M.missionOsPrompt(m,{...payload,steer:true})}));},
  async missionOsKeepGoing(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsKeepGoing',missionId:m.id,continuation:M.missionOsKeepGoing(m,payload),missionOs:report(m)},m));},
  async missionOsSteer(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsSteer',missionId:m.id,steering:M.missionOsSteer(m,payload),missionOs:report(m)},m));},
  async missionOsAddNode(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsAddNode',node:M.missionOsAddNode(m,payload),missionOs:report(m)},m));},
  async missionOsUpdateNode(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsUpdateNode',node:M.missionOsUpdateNode(m,payload),missionOs:report(m)},m));},
  async missionOsReceipt(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsReceipt',receipt:M.missionOsReceipt(m,payload),missionOs:report(m)},m));},
  async missionOsNext(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsNext',activeNode:M.missionOsNext(m),missionOs:report(m)},m));},
  async missionOsReleaseCourt(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsReleaseCourt',court:M.missionOsReleaseCourt(m),missionOs:report(m)},m));},
  async missionOsCycleCheck(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsCycleCheck',cycle:M.missionOsCycleCheck(m,payload),missionOs:report(m)},m));},
  async missionOsConstitution(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsConstitution',constitution:M.missionOsConstitution(m),missionOs:report(m)},m));}
};}
/**
 * B"H
 * Mission actions now refuse the sleepy cliff called done. They return a
 * continuation gate by default: keep going, steer if needed, but do not end
 * until release court proves the road is truly closed.
 */
module.exports={buildMissionOperatingActions};
