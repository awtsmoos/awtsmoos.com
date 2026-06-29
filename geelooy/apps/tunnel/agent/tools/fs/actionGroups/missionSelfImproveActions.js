// B"H
/**
 * B"H
 * Chapter 623: The scheduler began writing stones into AwtsmoosDB.
 * A later shliach can now resume from records, not rumors.
 */
function buildSelfImproveActions({ config, payload, M, use, withNext, metaPayload }) {
  return {
    async missionSelfImproveStart(){return use(config,payload,m=>{const out=M.selfImproveStart(m,metaPayload(payload,config));meta(M,config,m,'self_improve_start',payload,out);return withNext({ok:true,action:'missionSelfImproveStart',selfImprovement:out},m,payload);});},
    async missionSelfImprovePulse(){return use(config,payload,m=>{const out=M.selfImprovePulse(m,metaPayload(payload,config));meta(M,config,m,'self_improve_pulse',payload,out.receipt||out);return withNext({ok:true,action:'missionSelfImprovePulse',pulse:out,selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionSelfImproveRunBounded(){return use(config,payload,m=>{const out=M.SelfImprove.bounded(m,metaPayload(payload,config));meta(M,config,m,'self_improve_bounded_run',payload,out.runReceipt||out);return withNext({ok:true,action:'missionSelfImproveRunBounded',run:out,selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionSelfImproveSchedulerRun(){return use(config,payload,m=>{const out=M.SelfImprove.scheduler(m,metaPayload(payload,config));recordScheduler(M,config,m,payload,out,'self_improve');return withNext({ok:true,action:'missionSelfImproveSchedulerRun',scheduler:out,selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionSelfImproveSchedulerResume(){return use(config,payload,m=>{const records=schedulerRecords(M,config,m,payload);const out=M.SelfImprove.schedulerResume(m,{...metaPayload(payload,config),metadataRecords:records});recordScheduler(M,config,m,payload,out,'self_improve_resume');return withNext({ok:true,action:'missionSelfImproveSchedulerResume',scheduler:out,selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionSelfImproveSchedulerStatus(){return use(config,payload,m=>{const records=schedulerRecords(M,config,m,payload);return withNext({ok:true,action:'missionSelfImproveSchedulerStatus',scheduler:M.selfImproveStatus(m).schedulerRuns,persistedSchedulerRecords:records.length,selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionSelfImproveStatus(){return use(config,payload,m=>withNext({ok:true,action:'missionSelfImproveStatus',selfImprovement:M.selfImproveStatus(m)},m,payload));},
    async missionSelfImproveCourt(){return use(config,payload,m=>withNext({ok:true,action:'missionSelfImproveCourt',court:M.selfImproveCourt(m),selfImprovement:M.selfImproveStatus(m)},m,payload));},
    async missionInnovationLedger(){return use(config,payload,m=>withNext({ok:true,action:'missionInnovationLedger',ledger:M.selfImproveStatus(m).ledger},m,payload));},
    async missionNoveltyScore(){return use(config,payload,m=>withNext({ok:true,action:'missionNoveltyScore',novelty:M.selfImproveStatus(m).novelty},m,payload));},
    async missionBoredomCheck(){return use(config,payload,m=>withNext({ok:true,action:'missionBoredomCheck',boredom:M.selfImproveStatus(m).boredom},m,payload));},
    async missionRoleRotate(){return use(config,payload,m=>{const out=M.selfImprovePulse(m,{...metaPayload(payload,config),focus:'role rotation'});meta(M,config,m,'self_improve_role_rotate',payload,out.receipt||out);return withNext({ok:true,action:'missionRoleRotate',pulse:out},m,payload);});},
    async missionRoomSelfImprovePulse(){return use(config,payload,m=>{const out=M.selfImprovePulse(m,{...metaPayload(payload,config),agentId:payload.agentId||'room_agent',roomMessageHandled:true});meta(M,config,m,'room_self_improve_pulse',payload,out.receipt||out);return withNext({ok:true,action:'missionRoomSelfImprovePulse',pulse:out,roomStatus:M.roomStatus(m)},m,payload);});},
    async missionRoomSchedulerRun(){return use(config,payload,m=>{const out=M.SelfImprove.scheduler(m,{...metaPayload(payload,config),agentId:payload.agentId||'room_scheduler'});recordScheduler(M,config,m,payload,out,'room');return withNext({ok:true,action:'missionRoomSchedulerRun',scheduler:out,roomStatus:M.roomStatus(m),selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionRoomSchedulerResume(){return use(config,payload,m=>{const records=schedulerRecords(M,config,m,payload);const out=M.SelfImprove.schedulerResume(m,{...metaPayload(payload,config),agentId:payload.agentId||'room_scheduler',metadataRecords:records});recordScheduler(M,config,m,payload,out,'room_resume');return withNext({ok:true,action:'missionRoomSchedulerResume',scheduler:out,roomStatus:M.roomStatus(m),selfImprovement:M.selfImproveStatus(m)},m,payload);});},
    async missionRoomSummit(){return use(config,payload,m=>{const out=M.selfImproveSummit(m,metaPayload(payload,config));meta(M,config,m,'room_summit',payload,out.summit||out);return withNext({ok:true,action:'missionRoomSummit',summit:out,roomStatus:M.roomStatus(m)},m,payload);});},
    async missionRoomReplay(){return use(config,payload,m=>{const out=M.SelfImprove.replay(m,{...metaPayload(payload,config),metadataRecords:()=>M.MetadataStore.listRecords(config,{...metaPayload(payload,config),missionId:m.id,limit:payload.limit||500}).records||[]});meta(M,config,m,'room_replay',payload,{count:out.count,sources:out.sources});return withNext({ok:true,action:'missionRoomReplay',replay:out,roomStatus:M.roomStatus(m)},m,payload);});},
    async missionRoomHandoffPack(){return use(config,payload,m=>{const out=M.SelfImprove.handoff(m,metaPayload(payload,config));meta(M,config,m,'room_handoff_pack',payload,{agents:out.agents,nextRequiredAction:out.nextRequiredAction});return withNext({ok:true,action:'missionRoomHandoffPack',handoff:out,roomStatus:M.roomStatus(m)},m,payload);});},
    async missionRoomLoopCourt(){return use(config,payload,m=>{const court=M.selfImproveCourt(m);const mergeCourt=M.roomMergeCourt(m,metaPayload(payload,config));meta(M,config,m,'room_loop_court',payload,{court,mergeCourt});return withNext({ok:true,action:'missionRoomLoopCourt',court,mergeCourt,roomStatus:M.roomStatus(m)},m,payload);});},
    async missionRoomInnovationLedger(){return use(config,payload,m=>withNext({ok:true,action:'missionRoomInnovationLedger',ledger:M.selfImproveStatus(m).ledger,roomStatus:M.roomStatus(m)},m,payload));},
    async missionRoomTrustScore(){return use(config,payload,m=>withNext({ok:true,action:'missionRoomTrustScore',trust:M.selfImproveTrustScore(m,metaPayload(payload,config)),roomStatus:M.roomStatus(m)},m,payload));}
  };
}
function schedulerRecords(M, config, m, payload) {
  if (!M.MetadataStore) return [];
  return M.MetadataStore.listRecords(config, { ...payload, missionId: m.id, limit: payload.limit || 1000 }).records.filter(r => String(r.kind || '').includes('scheduler'));
}
function recordScheduler(M, config, m, payload, out, prefix) {
  meta(M, config, m, `${prefix}_scheduler_start`, payload, out.start || {});
  for (const point of out.checkpoints || []) meta(M, config, m, `${prefix}_scheduler_checkpoint`, payload, point);
  meta(M, config, m, `${prefix}_scheduler_finish`, payload, out.finish || out);
}
function meta(M, config, m, kind, payload, data) {
  if (!M.MetadataStore) return null;
  return M.MetadataStore.record(config, m, kind, { agentId: payload.agentId || 'agent', message: kind, payload: data });
}
module.exports = { buildSelfImproveActions };
