// B"H
const M = require('../mission/index.js');
function mid(p){return p.missionId||p.id||p.target||'';}
async function use(config,payload,fn){const m=await M.load(config,mid(payload));if(!m)return {ok:false,action:payload.action,error:'mission_not_found',missionId:mid(payload)};const out=await fn(m);await M.save(config,m);return out;}
function report(m){return M.missionOsStatus(m);}
function withPrompt(out,m){return {...out, missionInstruction:M.missionOsPrompt(m).instruction, prompt:M.missionOsPrompt(m)};}
function buildMissionOperatingActions(ctx){const {config}=ctx,payload=ctx.payload||{};return {
  async missionOsSeed(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsSeed',missionId:m.id,missionOs:M.missionOsSeed(m,payload),next:{action:'missionOsNext',missionId:m.id}},m));},
  async missionOsStatus(){return use(config,payload,m=>withPrompt({ok:true,action:'missionOsStatus',missionId:m.id,missionOs:report(m)},m));},
  async missionOsPrompt(){return use(config,payload,m=>({ok:true,action:'missionOsPrompt',missionId:m.id,prompt:M.missionOsPrompt(m,payload)}));},
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
 * Every response now carries one bell for the puppy: plain English, current
 * node, evidence debt, forbidden drift, and the exact next action. The noise
 * bows; the work graph speaks.
 */
module.exports={buildMissionOperatingActions};
